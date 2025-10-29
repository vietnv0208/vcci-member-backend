import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MembersService } from './members.service';
import {
  CreateMemberDto,
  UpdateMemberDto,
  QueryMemberDto,
  MemberResponseDto,
  MemberListResponseDto,
  ChangeMemberStatusDto,
  ActivateMemberDto,
  CreateMemberAccountDto,
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
import { ApplicationType, MemberStatus, MemberType } from '@prisma/client';

@ApiTags('Members')
@ApiBearerAuth('JWT-auth')
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Tạo đơn đăng ký hội viên mới' })
  @ApiResponse({
    status: 201,
    description: 'Đơn đăng ký đã được tạo thành công',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  async create(
    @Body() createMemberDto: CreateMemberDto,
    @Request() req,
  ): Promise<MemberResponseDto> {
    return this.membersService.create(createMemberDto, req.user.userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Lấy danh sách hội viên' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách hội viên',
    type: MemberListResponseDto,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Tìm kiếm theo tên, email, mã số thuế, mã hội viên, mã đơn đăng ký',
  })
  @ApiQuery({
    name: 'applicationType',
    required: false,
    enum: ApplicationType,
  })
  @ApiQuery({
    name: 'memberType',
    required: false,
    enum: MemberType,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: MemberStatus,
  })
  @ApiQuery({
    name: 'businessCategoryId',
    required: false,
    type: String,
    description: 'Lọc theo ngành nghề kinh doanh (sẽ tìm cả category con)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sắp xếp theo trường',
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @Query() query: QueryMemberDto,
  ): Promise<MemberListResponseDto> {
    return this.membersService.findAll(query);
  }

  @Get('statistics')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Lấy thống kê hội viên' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê hội viên',
  })
  async getStatistics() {
    return this.membersService.getStatistics();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết hội viên' })
  @ApiParam({ name: 'id', description: 'ID của hội viên' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết hội viên',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội viên' })
  async findOne(@Param('id') id: string): Promise<MemberResponseDto> {
    return this.membersService.findOne(id);
  }

  @Get('code/:code')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Lấy thông tin hội viên theo mã hội viên' })
  @ApiParam({ name: 'code', description: 'Mã hội viên' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết hội viên',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội viên' })
  async findByCode(@Param('code') code: string): Promise<MemberResponseDto> {
    return this.membersService.findByCode(code);
  }

  @Get('application-code/:applicationCode')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Lấy thông tin hội viên theo mã đơn đăng ký' })
  @ApiParam({ name: 'applicationCode', description: 'Mã đơn đăng ký hội viên' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết hội viên',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội viên' })
  async findByApplicationCode(@Param('applicationCode') applicationCode: string): Promise<MemberResponseDto> {
    return this.membersService.findByApplicationCode(applicationCode);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Cập nhật thông tin hội viên' })
  @ApiParam({ name: 'id', description: 'ID của hội viên' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin hội viên đã được cập nhật',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội viên' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    return this.membersService.update(id, updateMemberDto);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Thay đổi trạng thái hội viên' })
  @ApiParam({ name: 'id', description: 'ID của hội viên' })
  @ApiResponse({
    status: 200,
    description: 'Trạng thái hội viên đã được thay đổi',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội viên' })
  @ApiResponse({ status: 400, description: 'Chuyển trạng thái không hợp lệ' })
  async changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeMemberStatusDto,
    @Request() req,
  ): Promise<MemberResponseDto> {
    return this.membersService.changeStatus(
      id,
      changeStatusDto,
      req.user.userId,
    );
  }

  @Post(':id/activate')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({
    summary: 'Kích hoạt hội viên',
    description:
      'Chuyển trạng thái từ APPROVED sang ACTIVE, cập nhật trạng thái hội phí sang PAID và tạo lịch sử thanh toán',
  })
  @ApiParam({ name: 'id', description: 'ID của hội viên' })
  @ApiResponse({
    status: 200,
    description: 'Hội viên đã được kích hoạt thành công',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội viên' })
  @ApiResponse({
    status: 400,
    description: 'Hội viên không ở trạng thái APPROVED',
  })
  async activateMember(
    @Param('id') id: string,
    @Body() activateDto: ActivateMemberDto,
    @Request() req,
  ): Promise<MemberResponseDto> {
    return this.membersService.activateMember(id, activateDto, req.user.userId);
  }

  @Post(':id/create-account')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Tạo tài khoản đăng nhập cho hội viên (role MEMBER)' })
  @ApiParam({ name: 'id', description: 'ID của hội viên' })
  @ApiResponse({ status: 201, description: 'Tạo tài khoản thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội viên' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại hoặc hội viên đã có tài khoản' })
  async createMemberAccount(
    @Param('id') id: string,
    @Body() body: CreateMemberAccountDto,
  ): Promise<any> {
    return this.membersService.createMemberAccount(id, body.email, body.password);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa hội viên' })
  @ApiParam({ name: 'id', description: 'ID của hội viên' })
  @ApiResponse({ status: 204, description: 'Hội viên đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội viên' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.membersService.remove(id);
  }
}
