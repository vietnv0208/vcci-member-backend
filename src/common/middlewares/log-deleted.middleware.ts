import { Prisma } from '@prisma/client';

/**
 * Middleware tự động lưu record bị xóa vào bảng deleted_history
 * 
 * Hoạt động:
 * - Trước khi xóa (delete/deleteMany), lấy bản sao dữ liệu
 * - Tự động phát hiện cascade relations sử dụng Prisma.dmmf (public API)
 * - Lấy data của records con trước khi bị cascade delete
 * - Sau khi xóa thành công, lưu vào DeletedHistory kèm cascade data
 * - Lưu cả thông tin người xóa nếu có trong context
 * 
 * @note Sử dụng Prisma.dmmf thay vì prisma._dmmf (deprecated từ v4.16+)
 * @note Từ Prisma 5+, không cần type Prisma.Middleware nữa - Prisma sẽ tự infer type
 */

/**
 * Lấy danh sách các model có quan hệ onDelete: Cascade tới targetModel
 * Sử dụng Prisma.dmmf (public API) thay vì prisma._dmmf (private API deprecated)
 */
function getCascadeRelations(targetModel: string) {
  const cascadeRelations: Array<{
    model: string;
    field: string;
    relationFromFields: readonly string[];
  }> = [];

  try {
    // Sử dụng Prisma.dmmf - static metadata từ schema
    const models = Prisma.dmmf.datamodel.models;

    // Duyệt tất cả các model
    for (const model of models) {
      for (const field of model.fields) {
        // Kiểm tra field có phải là relation và có onDelete: Cascade không
        if (
          field.kind === 'object' &&
          field.relationFromFields?.length &&
          field.relationOnDelete === 'Cascade' &&
          field.type === targetModel
        ) {
          cascadeRelations.push({
            model: model.name,
            field: field.name,
            relationFromFields: field.relationFromFields,
          });
        }
      }
    }
  } catch (error) {
    console.error('[LogDeletedMiddleware] Failed to get cascade relations:', error);
  }

  return cascadeRelations;
}

/**
 * Lấy dữ liệu của các records con có cascade relation
 */
async function getCascadeLinkedData(
  prismaClient: any,
  modelName: string,
  modelKey: string,
  recordId: string
) {
  const cascades = getCascadeRelations(modelName);
  const cascadeData: Record<string, any[]> = {};

  for (const rel of cascades) {
    try {
      const relModelKey = rel.model.charAt(0).toLowerCase() + rel.model.slice(1);
      
      // Build where condition dựa trên relationFromFields
      const whereCondition: any = {};
      for (const fromField of rel.relationFromFields) {
        whereCondition[fromField] = recordId;
      }

      const linkedRecords = await prismaClient[relModelKey].findMany({
        where: whereCondition,
      });

      if (linkedRecords && linkedRecords.length > 0) {
        cascadeData[rel.model] = linkedRecords;
        console.log(`[LogDeletedMiddleware] 🔗 Found ${linkedRecords.length} cascade records in ${rel.model}`);
      }
    } catch (error) {
      console.error(`[LogDeletedMiddleware] Failed to fetch cascade data for ${rel.model}:`, error);
    }
  }

  return cascadeData;
}

/**
 * Tạo Prisma Client Extension để log deleted records
 * Sử dụng $extends API thay vì $use middleware (deprecated từ Prisma 5+)
 */
export function createLogDeletedExtension(
  prismaClient: any,
  getUserId?: () => string | undefined
) {
  return {
    query: {
      $allModels: {
        async delete({ model, operation, args, query }) {
          // Lấy dữ liệu trước khi xóa
          const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
          let recordBeforeDelete: any = null;
          let cascadeData: Record<string, any[]> = {};

          try {
            // Lấy record trước khi xóa
            recordBeforeDelete = await prismaClient[modelKey].findUnique({
              where: args.where,
            });

            if (recordBeforeDelete) {
              // Lấy cascade data nếu có
              cascadeData = await getCascadeLinkedData(
                prismaClient,
                model,
                modelKey,
                recordBeforeDelete.id
              );
            }
          } catch (error) {
            console.error(`[LogDeletedExtension] ❌ Failed to fetch record before delete for ${model}:`, error);
          }

          // Thực hiện xóa
          const result = await query(args);

          // Lưu log nếu có record bị xóa
          if (recordBeforeDelete) {
            await saveDeletedRecord(
              prismaClient,
              model,
              recordBeforeDelete,
              cascadeData,
              getUserId?.()
            );
          }

          return result;
        },

        async deleteMany({ model, operation, args, query }) {
          // Lấy dữ liệu trước khi xóa
          const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
          let recordsBeforeDelete: Array<{
            record: any;
            cascadeData?: Record<string, any[]>;
          }> = [];

          try {
            // Lấy records trước khi xóa
            const records = await prismaClient[modelKey].findMany({
              where: args.where,
            });

            if (records && records.length > 0) {
              // Lấy cascade data cho từng record
              for (const record of records) {
                const cascadeData = await getCascadeLinkedData(
                  prismaClient,
                  model,
                  modelKey,
                  record.id
                );
                
                recordsBeforeDelete.push({
                  record,
                  cascadeData: Object.keys(cascadeData).length > 0 ? cascadeData : undefined,
                });
              }
            }
          } catch (error) {
            console.error(`[LogDeletedExtension] ❌ Failed to fetch records before delete for ${model}:`, error);
          }

          // Thực hiện xóa
          const result = await query(args);

          // Lưu log cho từng record bị xóa
          for (const item of recordsBeforeDelete) {
            await saveDeletedRecord(
              prismaClient,
              model,
              item.record,
              item.cascadeData || {},
              getUserId?.()
            );
          }

          return result;
        }
      }
    }
  };
}

/**
 * Helper function để lưu deleted record vào history
 */
async function saveDeletedRecord(
  prismaClient: any,
  model: string,
  record: any,
  cascadeData: Record<string, any[]>,
  deletedBy?: string
) {
  try {
    // Prepare data structure
    const dataToSave: any = {
      ...record,
    };

    // Nếu có cascade data, lưu vào metadata
    if (cascadeData && Object.keys(cascadeData).length > 0) {
      dataToSave._cascadeDeleted = cascadeData;
      
      const cascadeSummary = Object.entries(cascadeData)
        .map(([model, records]) => `${model}(${records.length})`)
        .join(', ');
      console.log(`[LogDeletedExtension] 🔗 Cascade data: ${cascadeSummary}`);
    }

    await prismaClient.deletedHistory.create({
      data: {
        table: model,
        objectId: record.id ?? 'unknown',
        data: dataToSave,
        deletedBy,
      },
    });
    console.log(`[LogDeletedExtension] ✅ Saved deleted record: ${record.id}`);
  } catch (err) {
    console.error(
      `[LogDeletedExtension] ❌ Failed to save history for ${model}:`,
      err
    );
  }
}

