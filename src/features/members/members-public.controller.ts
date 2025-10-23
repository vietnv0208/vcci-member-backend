import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto, MemberResponseDto } from './dto';

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
}

