import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemberStatus } from '@prisma/client';

export class ChangeMemberStatusDto {
  @ApiProperty({ enum: MemberStatus, description: 'Trạng thái mới' })
  @IsEnum(MemberStatus)
  status: MemberStatus;

  @ApiPropertyOptional({ description: 'Ghi chú thay đổi trạng thái' })
  @IsOptional()
  @IsString()
  remark?: string;
}
