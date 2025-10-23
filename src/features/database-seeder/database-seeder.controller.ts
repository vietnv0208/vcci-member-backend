import {
  Controller,
  Post,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DatabaseSeederService, SeedResult } from './database-seeder.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@ApiTags('Database Seeder')
@Controller('database-seeder')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DatabaseSeederController {
  constructor(
    private readonly databaseSeederService: DatabaseSeederService,
  ) {}

  @Post('seeds')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Chạy database seeds an toàn cho deployment',
    description: `
    Chạy tất cả các seed files SQL một cách an toàn khi triển khai.
    
    Tính năng:
    - Sử dụng ON CONFLICT DO NOTHING để tránh lỗi duplicate
    - Có thể chạy nhiều lần mà không gây lỗi
    - Chạy theo thứ tự đúng dựa trên tên file
    - Thích hợp cho CI/CD deployment
    
    Seeds bao gồm:
    - Organization types (loại hình tổ chức)
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Database seeds đã được chạy thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        seedsExecuted: { type: 'array', items: { type: 'string' } },
        errors: { type: 'array', items: { type: 'string' } },
        executionTime: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi khi chạy database seeds',
  })
  @ApiResponse({
    status: 403,
    description: 'Chỉ SUPER_ADMIN được phép chạy seeds',
  })
  async runDatabaseSeeds(): Promise<SeedResult> {
    try {
      return await this.databaseSeederService.safeDeploymentSeed();
    } catch (error) {
      throw new HttpException(
        `Failed to run database seeds: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('seeds/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({
    summary: 'Kiểm tra trạng thái database seeds',
    description:
      'Trả về số lượng records hiện tại trong các bảng seeds để kiểm tra tình trạng',
  })
  @ApiResponse({
    status: 200,
    description: 'Trạng thái seeds được trả về thành công',
    schema: {
      type: 'object',
      properties: {
        organizationTypesCount: { type: 'number' },
      },
    },
  })
  async getDatabaseSeedsStatus() {
    try {
      return await this.databaseSeederService.checkSeedStatus();
    } catch (error) {
      throw new HttpException(
        `Failed to get seeds status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

