import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationType, MemberType, MemberStatus, ContactRole, Gender } from '@prisma/client';

export class MemberContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ContactRole })
  contactRole: ContactRole;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender;

  @ApiPropertyOptional()
  telephone?: string;

  @ApiPropertyOptional()
  mobile?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  note?: string;
}

export class MemberEnterpriseDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  businessRegistrationNo: string;

  @ApiPropertyOptional()
  businessRegistrationDate?: Date;

  @ApiPropertyOptional()
  issuedBy?: string;

  @ApiPropertyOptional()
  registeredCapital?: number;

  @ApiPropertyOptional()
  totalAsset?: number;

  @ApiPropertyOptional()
  previousYearRevenue?: number;

  @ApiPropertyOptional()
  totalEmployees?: number;

  @ApiPropertyOptional()
  branchInfo?: string;

  @ApiProperty({ type: [String] })
  organizationTypes: string[];
}

export class MemberAssociationDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  establishmentLicenseNo: string;

  @ApiPropertyOptional()
  establishmentDate?: Date;

  @ApiPropertyOptional()
  issuedBy?: string;

  @ApiPropertyOptional()
  totalMembers?: number;
}

export class MemberResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  code?: string;

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

  @ApiPropertyOptional({ type: MemberEnterpriseDetailResponseDto })
  enterpriseDetail?: MemberEnterpriseDetailResponseDto;

  @ApiPropertyOptional({ type: MemberAssociationDetailResponseDto })
  associationDetail?: MemberAssociationDetailResponseDto;

  @ApiProperty({ type: [MemberContactResponseDto] })
  contacts: MemberContactResponseDto[];

  @ApiProperty({ type: [String] })
  attachmentIds: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MemberListResponseDto {
  @ApiProperty({ type: [MemberResponseDto] })
  data: MemberResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
