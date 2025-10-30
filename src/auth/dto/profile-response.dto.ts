import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemberResponseDto } from '../../features/members/dto/member-response.dto';


export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  role: string;

  @ApiPropertyOptional()
  department?: string | null;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  deleted: boolean;

  @ApiProperty({ type: () => MemberResponseDto, nullable: true })
  member: MemberResponseDto | null;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  lastLogin?: Date | null;
}


