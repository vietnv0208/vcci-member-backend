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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentHistoryService } from './payment-history.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Role } from '../../../auth/enums/role.enum';
import {
  CreatePaymentHistoryDto,
  UpdatePaymentHistoryDto,
  QueryPaymentHistoryDto,
  PaymentHistoryResponseDto,
} from './dto';

@ApiTags('Payment History')
@Controller('payment-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentHistoryController {
  constructor(private readonly paymentHistoryService: PaymentHistoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Tạo lịch sử thanh toán mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo lịch sử thanh toán thành công',
    type: PaymentHistoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy hội viên',
  })
  @ApiResponse({
    status: 409,
    description: 'Mã giao dịch đã tồn tại',
  })
  async create(
    @Body() createPaymentHistoryDto: CreatePaymentHistoryDto,
  ): Promise<PaymentHistoryResponseDto> {
    await this.paymentHistoryService.validatePaymentData(
      createPaymentHistoryDto,
    );
    return this.paymentHistoryService.create(createPaymentHistoryDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Lấy danh sách lịch sử thanh toán' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách lịch sử thanh toán thành công',
  })
  async findAll(@Query() query: QueryPaymentHistoryDto) {
    return this.paymentHistoryService.findAll(query);
  }

  @Get('summary')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Lấy thống kê thanh toán' })
  @ApiQuery({
    name: 'memberId',
    description: 'ID của hội viên (tùy chọn)',
    required: false,
  })
  @ApiQuery({
    name: 'year',
    description: 'Năm hội phí (tùy chọn)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thanh toán thành công',
  })
  async getSummary(
    @Query('memberId') memberId?: string,
    @Query('year') year?: number,
  ) {
    return this.paymentHistoryService.getPaymentSummary(memberId, year);
  }

  @Get('generate-code/:year')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Tạo mã giao dịch mới cho năm' })
  @ApiParam({
    name: 'year',
    description: 'Năm hội phí',
    example: 2024,
  })
  @ApiResponse({
    status: 200,
    description: 'Tạo mã giao dịch thành công',
    schema: {
      type: 'object',
      properties: {
        paymentCode: {
          type: 'string',
          example: 'VCCI-PAY-2024-001',
        },
      },
    },
  })
  async generatePaymentCode(@Param('year') year: number) {
    const paymentCode =
      await this.paymentHistoryService.generatePaymentCode(year);
    return { paymentCode };
  }

  @Get('member/:memberId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Lấy lịch sử thanh toán của hội viên' })
  @ApiParam({
    name: 'memberId',
    description: 'ID của hội viên',
  })
  @ApiQuery({
    name: 'year',
    description: 'Năm hội phí (tùy chọn)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy lịch sử thanh toán của hội viên thành công',
    type: [PaymentHistoryResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy hội viên',
  })
  async findByMemberId(
    @Param('memberId') memberId: string,
    @Query('year') year?: number,
  ): Promise<PaymentHistoryResponseDto[]> {
    return this.paymentHistoryService.findByMemberId(memberId, year);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Lấy chi tiết lịch sử thanh toán' })
  @ApiParam({
    name: 'id',
    description: 'ID của lịch sử thanh toán',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết lịch sử thanh toán thành công',
    type: PaymentHistoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy lịch sử thanh toán',
  })
  async findOne(@Param('id') id: string): Promise<PaymentHistoryResponseDto> {
    return this.paymentHistoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGEMENT)
  @ApiOperation({ summary: 'Cập nhật lịch sử thanh toán' })
  @ApiParam({
    name: 'id',
    description: 'ID của lịch sử thanh toán',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật lịch sử thanh toán thành công',
    type: PaymentHistoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy lịch sử thanh toán hoặc hội viên',
  })
  @ApiResponse({
    status: 409,
    description: 'Mã giao dịch đã tồn tại',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentHistoryDto: UpdatePaymentHistoryDto,
  ): Promise<PaymentHistoryResponseDto> {
    await this.paymentHistoryService.validatePaymentData(
      updatePaymentHistoryDto,
    );
    return this.paymentHistoryService.update(id, updatePaymentHistoryDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa lịch sử thanh toán' })
  @ApiParam({
    name: 'id',
    description: 'ID của lịch sử thanh toán',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa lịch sử thanh toán thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy lịch sử thanh toán',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.paymentHistoryService.remove(id);
  }
}
