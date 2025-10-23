import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

export interface SeedResult {
  success: boolean;
  message: string;
  seedsExecuted: string[];
  errors: string[];
  executionTime: number;
}

@Injectable()
export class DatabaseSeederService {
  private readonly logger = new Logger(DatabaseSeederService.name);
  private readonly seedsPath = path.join(process.cwd(), 'prisma', 'seeds');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Chạy tất cả các seed files một cách an toàn khi triển khai
   * Sử dụng ON CONFLICT DO NOTHING để tránh lỗi duplicate
   */
  async runAllSeeds(): Promise<SeedResult> {
    const startTime = Date.now();
    const result: SeedResult = {
      success: true,
      message: '',
      seedsExecuted: [],
      errors: [],
      executionTime: 0,
    };

    try {
      this.logger.log('🌱 Bắt đầu chạy database seeds...');

      // Lấy danh sách tất cả seed files, sắp xếp theo thứ tự
      const seedFiles = this.getSeedFiles();

      if (seedFiles.length === 0) {
        result.message = 'Không tìm thấy seed files nào';
        this.logger.warn(result.message);
        return result;
      }

      this.logger.log(
        `📋 Tìm thấy ${seedFiles.length} seed files: ${seedFiles.join(', ')}`,
      );

      // Chạy từng seed file theo thứ tự
      for (const seedFile of seedFiles) {
        try {
          await this.executeSeedFile(seedFile);
          result.seedsExecuted.push(seedFile);
          this.logger.log(`✅ Thành công: ${seedFile}`);
        } catch (error) {
          const errorMessage = `Lỗi khi chạy ${seedFile}: ${error.message}`;
          result.errors.push(errorMessage);
          this.logger.error(`❌ ${errorMessage}`);

          // Tiếp tục chạy các seed khác thay vì dừng lại
          result.success = false;
        }
      }

      result.executionTime = Date.now() - startTime;

      if (result.success) {
        result.message = `✅ Hoàn thành seeds thành công! Đã chạy ${result.seedsExecuted.length} seeds trong ${result.executionTime}ms`;
        this.logger.log(result.message);
      } else {
        result.message = `⚠️ Hoàn thành với một số lỗi. Thành công: ${result.seedsExecuted.length}, Lỗi: ${result.errors.length}`;
        this.logger.warn(result.message);
      }
    } catch (error) {
      result.success = false;
      result.message = `Lỗi nghiêm trọng khi chạy seeds: ${error.message}`;
      result.errors.push(result.message);
      result.executionTime = Date.now() - startTime;
      this.logger.error(result.message, error.stack);
    }

    return result;
  }

  /**
   * Chạy một seed file cụ thể
   */
  async executeSeedFile(fileName: string): Promise<void> {
    const filePath = path.join(this.seedsPath, fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Seed file không tồn tại: ${fileName}`);
    }

    this.logger.log(`🔄 Đang chạy seed: ${fileName}`);

    // Đọc nội dung SQL file
    const sqlContent = fs.readFileSync(filePath, 'utf8');

    if (!sqlContent.trim()) {
      throw new Error(`Seed file rỗng: ${fileName}`);
    }

    // Kiểm tra xem có sử dụng ON CONFLICT hay không
    if (!sqlContent.includes('ON CONFLICT')) {
      this.logger.warn(
        `⚠️ Seed file ${fileName} không sử dụng ON CONFLICT - có thể gây lỗi duplicate`,
      );
    }

    // Thực thi SQL
    try {
      await this.prisma.$executeRawUnsafe(sqlContent);
      this.logger.log(`✅ Hoàn thành seed: ${fileName}`);
    } catch (error) {
      // Log chi tiết lỗi SQL để debug
      this.logger.error(`SQL Error in ${fileName}:`, {
        error: error.message,
        code: error.code,
        sqlContent: sqlContent.substring(0, 200) + '...', // Hiển thị 200 ký tự đầu
      });
      throw error;
    }
  }

  /**
   * Lấy danh sách seed files đã sắp xếp theo thứ tự
   */
  private getSeedFiles(): string[] {
    try {
      if (!fs.existsSync(this.seedsPath)) {
        this.logger.warn(`Thư mục seeds không tồn tại: ${this.seedsPath}`);
        return [];
      }

      const files = fs
        .readdirSync(this.seedsPath)
        .filter((file) => file.endsWith('.sql'))
        .sort(); // Sắp xếp theo tên file (theo thời gian do format YYYYMMDD)

      return files;
    } catch (error) {
      this.logger.error(`Lỗi khi đọc thư mục seeds: ${error.message}`);
      return [];
    }
  }

  /**
   * Kiểm tra trạng thái các seed đã được chạy chưa
   */
  async checkSeedStatus(): Promise<{
    organizationTypesCount: number;
  }> {
    try {
      const organizationTypesCount = await this.prisma.category.count({
        where: {
          type: 'ORGANIZATION_TYPE',
          deleted: false,
        },
      });

      return {
        organizationTypesCount,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi kiểm tra seed status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Chạy seed cho deployment an toàn
   * Có thể được gọi nhiều lần mà không gây lỗi
   */
  async safeDeploymentSeed(): Promise<SeedResult> {
    this.logger.log('🚀 Bắt đầu safe deployment seeding...');

    // Kiểm tra trạng thái hiện tại
    const beforeStatus = await this.checkSeedStatus();
    this.logger.log('📊 Trạng thái trước khi seed:', beforeStatus);

    // Chạy seeds
    const result = await this.runAllSeeds();

    // Kiểm tra trạng thái sau khi chạy
    const afterStatus = await this.checkSeedStatus();
    this.logger.log('📊 Trạng thái sau khi seed:', afterStatus);

    // Thêm thông tin về số lượng records
    result.message += `\n📊 Trạng thái sau seeding:
- Organization types: ${afterStatus.organizationTypesCount}`;

    return result;
  }
}

