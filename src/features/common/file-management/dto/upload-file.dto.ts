import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { FileCategory } from '@prisma/client';

export class UploadFileDto {
  @ApiProperty({ 
    enum: FileCategory, 
    description: 'File category',
    required: false 
  })
  @IsOptional()
  @IsEnum(FileCategory)
  category?: FileCategory;

  @ApiProperty({ 
    description: 'ID of the entity this file belongs to',
    required: false 
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({ 
    description: 'Type of entity this file belongs to',
    required: false 
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({ 
    description: 'Target folder path for upload (e.g., /Documents/Projects)',
    required: false 
  })
  @IsOptional()
  @IsString()
  folderPath?: string;

  @ApiProperty({ 
    description: 'File description',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;
}
