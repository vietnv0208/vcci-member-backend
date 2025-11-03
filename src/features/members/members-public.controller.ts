import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto, MemberResponseDto } from './dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { MemberPublicResponseDto } from './dto/member-public-response.dto';

@ApiTags('Members (Public)')
@Controller('public/members')
export class MembersPublicController {
  constructor(private readonly membersService: MembersService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký hội viên mới (Public - không cần authentication)',
    description:
      'API công khai cho phép doanh nghiệp/hiệp hội tự đăng ký làm hội viên VCCI. Đơn đăng ký sẽ có trạng thái PENDING và chờ xét duyệt.',
  })
  @ApiResponse({
    status: 201,
    description: 'Đơn đăng ký đã được tạo thành công và đang chờ xét duyệt',
    type: MemberResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
  })
  @ApiResponse({
    status: 409,
    description: 'Email đã tồn tại trong hệ thống',
  })
  async register(
    @Body() createMemberDto: CreateMemberDto,
  ): Promise<MemberResponseDto> {
    // Public registration - không truyền userId
    return this.membersService.create(createMemberDto);
  }

  @Get('application-code/:applicationCode')
  @ApiOperation({ summary: 'Lấy thông tin hội viên theo mã đơn đăng ký' })
  @ApiParam({ name: 'applicationCode', description: 'Mã đơn đăng ký hội viên' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết hội viên',
    type: MemberResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hội viên' })
  async findByApplicationCode(
    @Param('applicationCode') applicationCode: string,
  ): Promise<MemberResponseDto> {
    const memberResponseDto =
      await this.membersService.findByApplicationCode(applicationCode);
    const publicMemberData: MemberResponseDto = {
      ...memberResponseDto,
      // Chỉ trả về các trường công khai
      memberPaymentHistory: undefined,
    };

    return publicMemberData;
  }
}
