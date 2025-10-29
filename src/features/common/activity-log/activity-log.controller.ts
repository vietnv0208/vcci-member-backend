import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { ActivityActionType } from './enums/activity-action-type.enum';
import { ActivityTargetType } from './enums/activity-target-type.enum';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Role } from '../../../auth/enums/role.enum';

@ApiTags('Activity Logs')
@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Lấy danh sách hoạt động' })
  @ApiQuery({ name: 'action', required: false, enum: ActivityActionType })
  @ApiQuery({ name: 'targetType', required: false, enum: ActivityTargetType })
  @ApiQuery({ name: 'targetId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getActivityLogs(
    @Query('action') action?: ActivityActionType,
    @Query('targetType') targetType?: ActivityTargetType,
    @Query('targetId') targetId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filters: any = {
      action,
      targetType,
      targetId,
      userId,
      page: page || 1,
      limit: limit || 20,
    };

    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    return this.activityLogService.getActivityLogs(filters);
  }
}
