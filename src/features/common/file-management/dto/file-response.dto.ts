import { ApiProperty } from '@nestjs/swagger';
import { FileType, FileVisibility, StorageType } from '@prisma/client';

export class FileResponseDto {
  @ApiProperty({ description: 'File ID' })
  id: string;

  @ApiProperty({ description: 'File name' })
  fileName: string;

  @ApiProperty({ enum: FileType, description: 'File type' })
  fileType: FileType;

  @ApiProperty({ enum: StorageType, description: 'Storage type' })
  storeType: StorageType;

  @ApiProperty({ description: 'MIME type', required: false })
  mimeType?: string;

  @ApiProperty({ description: 'File size in bytes', required: false })
  fileSize?: number;

  @ApiProperty({ description: 'Storage path or S3 key' })
  storagePath: string;

  @ApiProperty({ description: 'Public URL', required: false })
  publicUrl?: string;

  @ApiProperty({ description: 'File checksum', required: false })
  checksum?: string;

  @ApiProperty({ description: 'Entity type', required: false })
  entityType?: string;

  @ApiProperty({ description: 'Entity ID', required: false })
  entityId?: string;

  @ApiProperty({ description: 'Temporary key for grouping files', required: false })
  tempKey?: string;

  @ApiProperty({ description: 'File category', required: false })
  category?: string;

  @ApiProperty({ description: 'File description', required: false })
  description?: string;

  @ApiProperty({ description: 'Folder ID', required: false })
  folderId?: string;

  @ApiProperty({ description: 'Uploaded by user ID', required: false })
  uploadedById?: string;

  @ApiProperty({ enum: FileVisibility, description: 'File visibility' })
  visibility: FileVisibility;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Whether file is deleted' })
  deleted: boolean;
}
