import { IsEnum, IsString, IsOptional, IsEmail, IsDateString, IsArray, ValidateNested, IsInt, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationType, MemberType, ContactRole, Gender, OrganizationType } from '@prisma/client';

export class CreateMemberContactDto {
  @ApiProperty({ enum: ContactRole, description: 'Vai trò liên hệ' })
  @IsEnum(ContactRole)
  contactRole: ContactRole;

  @ApiProperty({ description: 'Họ và tên' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ enum: Gender, description: 'Giới tính' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Số điện thoại cố định' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại di động' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateMemberEnterpriseDetailDto {
  @ApiProperty({ description: 'Số đăng ký kinh doanh' })
  @IsString()
  businessRegistrationNo: string;

  @ApiPropertyOptional({ description: 'Ngày đăng ký kinh doanh' })
  @IsOptional()
  @IsDateString()
  businessRegistrationDate?: Date;

  @ApiPropertyOptional({ description: 'Nơi cấp' })
  @IsOptional()
  @IsString()
  issuedBy?: string;

  @ApiPropertyOptional({ description: 'Vốn điều lệ' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  registeredCapital?: number;

  @ApiPropertyOptional({ description: 'Tổng tài sản' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalAsset?: number;

  @ApiPropertyOptional({ description: 'Doanh thu năm trước' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  previousYearRevenue?: number;

  @ApiPropertyOptional({ description: 'Tổng số nhân viên' })
  @IsOptional()
  @IsInt()
  totalEmployees?: number;

  @ApiPropertyOptional({ description: 'Thông tin chi nhánh' })
  @IsOptional()
  @IsString()
  branchInfo?: string;

  @ApiProperty({ description: 'Loại hình tổ chức', type: [String] })
  @IsArray()
  @IsString({ each: true })
  organizationTypes: string[];
}

export class CreateMemberAssociationDetailDto {
  @ApiProperty({ description: 'Số quyết định thành lập' })
  @IsString()
  establishmentLicenseNo: string;

  @ApiPropertyOptional({ description: 'Ngày thành lập' })
  @IsOptional()
  @IsDateString()
  establishmentDate?: Date;

  @ApiPropertyOptional({ description: 'Nơi cấp' })
  @IsOptional()
  @IsString()
  issuedBy?: string;

  @ApiPropertyOptional({ description: 'Tổng số hội viên' })
  @IsOptional()
  @IsInt()
  totalMembers?: number;
}

export class CreateMemberDto {
  @ApiProperty({ enum: ApplicationType, description: 'Loại đơn đăng ký' })
  @IsEnum(ApplicationType)
  applicationType: ApplicationType;

  @ApiPropertyOptional({ enum: MemberType, description: 'Loại hội viên', default: 'LINKED' })
  @IsOptional()
  @IsEnum(MemberType)
  memberType?: MemberType;

  @ApiProperty({ description: 'Tên tiếng Việt' })
  @IsString()
  vietnameseName: string;

  @ApiPropertyOptional({ description: 'Tên tiếng Anh' })
  @IsOptional()
  @IsString()
  englishName?: string;

  @ApiPropertyOptional({ description: 'Tên viết tắt' })
  @IsOptional()
  @IsString()
  abbreviation?: string;

  @ApiProperty({ description: 'Địa chỉ trụ sở chính' })
  @IsString()
  officeAddress: string;

  @ApiPropertyOptional({ description: 'Địa chỉ kinh doanh' })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiProperty({ description: 'Số điện thoại' })
  @IsString()
  telephone: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiPropertyOptional({ description: 'Website' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'Mã số thuế' })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiPropertyOptional({ description: 'Ngày hết hạn' })
  @IsOptional()
  @IsDateString()
  expireDate?: Date;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Chi tiết doanh nghiệp' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMemberEnterpriseDetailDto)
  enterpriseDetail?: CreateMemberEnterpriseDetailDto;

  @ApiPropertyOptional({ description: 'Chi tiết hiệp hội' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMemberAssociationDetailDto)
  associationDetail?: CreateMemberAssociationDetailDto;

  @ApiProperty({ description: 'Danh sách người liên hệ', type: [CreateMemberContactDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMemberContactDto)
  contacts: CreateMemberContactDto[];

  @ApiPropertyOptional({ description: 'Danh mục ngành nghề', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessCategoryIds?: string[];

  @ApiPropertyOptional({ description: 'Danh sách file đính kèm', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentIds?: string[];
}
