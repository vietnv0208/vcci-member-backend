import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from './members.service';
import {
  MemberResponseDto,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  ActivityLogService,
  ActivityActionType,
  ActivityTargetType,
} from '../common/activity-log';

@ApiTags('Members (My Application)')
@ApiBearerAuth('JWT-auth')
@Controller('members-my')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersMyController {
  constructor(
    private readonly membersService: MembersService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Get('application')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết đơn đăng ký' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết đơn đăng ký',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn đăng ký' })
  async findOne(@Request() req): Promise<MemberResponseDto> {
    return this.membersService.findMyApplicationByUserId(req.user.id);
  }

  @Get('activity-logs')
  @ApiOperation({ summary: 'Xem lịch sử hoạt động của hội viên' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lịch sử hoạt động',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội viên' })
  @ApiQuery({ name: 'action', required: false, enum: ActivityActionType })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getActivityLogs(
    @Request() req,
    @Query('action') action?: ActivityActionType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // Lấy thông tin user để lấy memberId
    const member = await this.membersService.findMyApplicationByUserId(
      req.user.id,
    );

    if (!member) {
      throw new NotFoundException('Không tìm thấy thông tin hội viên');
    }

    // Tạo filters với memberId từ current user
    const filters: any = {
      targetType: ActivityTargetType.MEMBER,
      targetId: member.id,
      action,
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
