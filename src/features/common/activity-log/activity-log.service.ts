import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { ActivityActionType } from './enums/activity-action-type.enum';
import { ActivityTargetType } from './enums/activity-target-type.enum';
import {
  ActivityLogData,
  ActivityLogTemplate,
  ActivityLogContext,
} from './interfaces/activity-log.interface';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  // Template cho các loại hoạt động
  private readonly templates: Record<ActivityActionType, ActivityLogTemplate> =
    {
      [ActivityActionType.SUBMIT_APPLICATION]: {
        title: 'Nộp hồ sơ gia nhập',
        description: '{applicationTypeName} {memberName} Nộp hồ sơ gia nhập VCCI ngày {date}',
      },
      [ActivityActionType.APPROVE_APPLICATION]: {
        title: 'Xét duyệt hồ sơ',
        description: 'Xét duyệt hồ sơ hội viên {memberName} - {memberCode}',
      },
      [ActivityActionType.REJECT_APPLICATION]: {
        title: 'Từ chối hồ sơ',
        description:
          'Từ chối hồ sơ hội viên {memberName} - {memberCode}. Lý do: {reason}',
      },
      [ActivityActionType.PAY_ANNUAL_FEE]: {
        title: 'Thanh toán hội phí',
        description: 'Hội viên {memberName} - {memberCode} thanh toán hội phí năm {year}, Số tiền: {amount} VNĐ',
      },
      [ActivityActionType.MEMBER_ACTIVATED]: {
        title: 'Kích hoạt hội viên',
        description:
          'Kích hoạt trạng thái hội viên {memberName} - {memberCode}',
      },
      [ActivityActionType.MEMBER_SUSPENDED]: {
        title: 'Tạm ngưng hội viên',
        description:
          'Tạm ngưng trạng thái hội viên {memberName} - {memberCode}. Lý do: {reason}',
      },
      [ActivityActionType.PAY_MULTI_YEARS]: {
        title: 'Thanh toán nhiều năm',
        description: 'Hội viên {memberName} - {memberCode} thanh toán hội phí các năm {years}, Tổng: {amount} VNĐ',
      },
      [ActivityActionType.EDIT_BASIC_INFO]: {
        title: 'Cập nhật thông tin',
        description: 'Cập nhật thông tin hội viên',
      },
      [ActivityActionType.UPDATE_ATTACHMENT]: {
        title: 'Cập nhật tài liệu',
        description: 'Cập nhật tài liệu đính kèm: {fileName}',
      },
      [ActivityActionType.LOGIN]: {
        title: 'Đăng nhập hệ thống',
        description: 'Đăng nhập vào hệ thống từ IP {ipAddress}',
      },
      [ActivityActionType.LOGOUT]: {
        title: 'Đăng xuất hệ thống',
        description: 'Đăng xuất khỏi hệ thống',
      },
      [ActivityActionType.CHANGE_PASSWORD]: {
        title: 'Đổi mật khẩu',
        description: 'Thay đổi mật khẩu tài khoản',
      },
      [ActivityActionType.RESET_PASSWORD]: {
        title: 'Reset mật khẩu',
        description: 'Reset mật khẩu cho tài khoản {username}',
      },
      [ActivityActionType.CREATE_USER_FOR_MEMBER]: {
        title: 'Tạo tài khoản',
        description: 'Tạo tài khoản cho hội viên "{memberName}" tên đăng nhập: {email}',
      },
      [ActivityActionType.CREATE_USER]: {
        title: 'Tạo tài khoản',
        description: 'Tạo tài khoản mới: {email} - {role}',
      },
      [ActivityActionType.UPDATE_USER]: {
        title: 'Cập nhật tài khoản',
        description: 'Cập nhật thông tin tài khoản: {email}',
      },
      [ActivityActionType.DELETE_USER]: {
        title: 'Xóa tài khoản',
        description: 'Xóa tài khoản: {email}',
      },
      [ActivityActionType.UPLOAD_FILE]: {
        title: 'Tải lên tài liệu',
        description: 'Tải lên tài liệu: {fileName} ({fileSize})',
      },
      [ActivityActionType.DELETE_FILE]: {
        title: 'Xóa tài liệu',
        description: 'Xóa tài liệu: {fileName}',
      },
    };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Render template với context data
   */
  private renderTemplate(
    template: string,
    context: ActivityLogContext,
  ): string {
    if (!template) return '';

    return template.replace(/\{([^}]+)\}/g, (match, key) => {
      const value = this.getNestedValue(context, key.trim());
      return value !== undefined && value !== null ? value.toString() : match;
    });
  }

  /**
   * Lấy giá trị nested từ object (ví dụ: member.name)
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Tạo log hoạt động với template tự động
   */
  async logActivity(
    action: ActivityActionType,
    context: ActivityLogContext,
    options?: {
      targetType?: ActivityTargetType;
      targetId?: string;
      userId?: string;
      requestData?: any;
      responseData?: any;
      ipAddress?: string;
      customTitle?: string;
      customDescription?: string;
    },
  ): Promise<void> {
    try {
      const template = this.templates[action];
      const title = options?.customTitle || template.title;
      const description =
        options?.customDescription ||
        this.renderTemplate(template.description, context);

      await this.prisma.activityLog.create({
        data: {
          action,
          title,
          description,
          targetType: options?.targetType || null,
          targetId: options?.targetId || null,
          userId: options?.userId || null,
          requestData: options?.requestData
            ? JSON.stringify(options.requestData)
            : undefined,
          responseData: options?.responseData
            ? JSON.stringify(options.responseData)
            : undefined,
          ipAddress: options?.ipAddress || null,
        },
      });

      this.logger.debug(`✅ Activity logged: ${action} - ${title}`);
    } catch (error) {
      this.logger.error(`❌ Failed to log activity: ${action}`, error);
    }
  }

  /**
   * Tạo log hoạt động đơn giản (không dùng template)
   */
  async logSimpleActivity(
    action: ActivityActionType,
    title: string,
    description?: string,
    options?: {
      targetType?: ActivityTargetType;
      targetId?: string;
      userId?: string;
      requestData?: any;
      responseData?: any;
      ipAddress?: string;
    },
  ): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          action,
          title,
          description,
          targetType: options?.targetType || null,
          targetId: options?.targetId || null,
          userId: options?.userId || null,
          requestData: options?.requestData
            ? JSON.stringify(options.requestData)
            : undefined,
          responseData: options?.responseData
            ? JSON.stringify(options.responseData)
            : undefined,
          ipAddress: options?.ipAddress || null,
        },
      });

      this.logger.debug(`✅ Simple activity logged: ${action} - ${title}`);
    } catch (error) {
      this.logger.error(`❌ Failed to log simple activity: ${action}`, error);
    }
  }

  /**
   * Lấy danh sách hoạt động theo điều kiện
   */
  async getActivityLogs(filters: {
    action?: ActivityActionType;
    targetType?: ActivityTargetType;
    targetId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      action,
      targetType,
      targetId,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {};
    if (action) where.action = action;
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
