import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ApplicationType,
  MemberType,
  MemberStatus,
} from '@prisma/client';

export class MemberPublicResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  code?: string;

  @ApiPropertyOptional()
  applicationCode?: string;

  @ApiProperty({ enum: ApplicationType })
  applicationType: ApplicationType;

  @ApiProperty({ enum: MemberType })
  memberType: MemberType;

  @ApiProperty({ enum: MemberStatus })
  status: MemberStatus;

  @ApiProperty()
  vietnameseName: string;

  @ApiPropertyOptional()
  englishName?: string;

  @ApiPropertyOptional()
  abbreviation?: string;

  @ApiProperty()
  officeAddress: string;

  @ApiPropertyOptional()
  businessAddress?: string;

  @ApiProperty()
  telephone: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  taxCode?: string;

  @ApiPropertyOptional()
  submittedDate?: Date;

  @ApiPropertyOptional()
  approvedDate?: Date;

  @ApiPropertyOptional()
  joinDate?: Date;

  @ApiPropertyOptional()
  expireDate?: Date;

  @ApiPropertyOptional()
  remarks?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
