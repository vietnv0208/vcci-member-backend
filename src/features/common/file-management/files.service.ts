import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { FileResponseDto, UploadFileDto, CreateFolderDto } from './dto';
import {
  FileType,
  FileVisibility,
  StorageType,
  FileCategory,
} from '@prisma/client';
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, extname, dirname } from 'path';
import { randomBytes } from 'crypto';
import { createHash } from 'crypto';
import type { Response } from 'express';
import { StreamableFile } from '@nestjs/common';

@Injectable()
export class FilesService {
  private readonly uploadPath = process.env.UPLOAD_PATH || './uploads';

  constructor(private prisma: PrismaService) {
    // Ensure upload directory exists
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    body: UploadFileDto,
    userId: string,
  ): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Determine file type based on MIME type
    const fileType = this.getFileTypeFromMime(file.mimetype);

    // Generate unique filename
    const fileExtension = extname(file.originalname);
    const uniqueFileName = `${randomBytes(16).toString('hex')}${fileExtension}`;

    // Generate tempKey if no entityId provided
    const tempKey = body.entityId ? null : `temp_${randomBytes(8).toString('hex')}`;

    // Create relative storage path based on entityType/category/entityId or folderPath
    const relativePath = this.createRelativePath(body);
    // const relativePath = this.createRelativePath(body, tempKey || undefined);
    const fullStoragePath = join(this.uploadPath, relativePath, uniqueFileName);
    const relativeStoragePath = join(relativePath, uniqueFileName);

    // Ensure directory exists
    const dirPath = dirname(fullStoragePath);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }

    // Calculate file checksum
    const checksum = createHash('md5').update(file.buffer).digest('hex');

    // Save file to disk
    const writeStream = createWriteStream(fullStoragePath);
    writeStream.write(file.buffer);
    writeStream.end();

    // Create file record in database
    const fileRecord = await this.prisma.file.create({
      data: {
        fileName: file.originalname,
        fileType,
        storeType: StorageType.LOCAL,
        mimeType: file.mimetype,
        fileSize: file.size,
        storagePath: relativeStoragePath, // Store only relative path
        checksum,
        entityType: body.entityType,
        entityId: body.entityId,
        tempKey,
        category: body.category,
        description: body.description,
        uploadedById: userId,
        visibility: FileVisibility.PRIVATE,
      },
    });

    return this.mapFileToResponse(fileRecord);
  }

  async getFile(fileId: string): Promise<FileResponseDto> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId, deleted: false },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return this.mapFileToResponse(file);
  }

  async downloadFile(
    fileId: string,
    res: Response,
    userId: string,
  ): Promise<StreamableFile> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId, deleted: false },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Get full storage path
    const fullStoragePath = this.getFullStoragePath(file.storagePath);
    
    // Check if file exists on disk
    if (!existsSync(fullStoragePath)) {
      throw new NotFoundException('File not found on disk');
    }

    // Set appropriate headers
    res.set({
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
      'Content-Length': file.fileSize?.toString() || '',
    });

    const fileStream = createReadStream(fullStoragePath);
    return new StreamableFile(fileStream);
  }

  async getDownloadUrl(
    fileId: string,
    userId: string,
  ): Promise<{ downloadUrl: string }> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId, deleted: false },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // For local storage, return the file path or generate a temporary URL
    // In a production environment, you might want to generate signed URLs
    const downloadUrl = `/api/files/${fileId}/download`;

    return { downloadUrl };
  }

  async deleteFile(fileId: string): Promise<void> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Soft delete the file record
    await this.prisma.file.update({
      where: { id: fileId },
      data: { deleted: true },
    });

    // Optionally delete the physical file
    const fullStoragePath = this.getFullStoragePath(file.storagePath);
    if (existsSync(fullStoragePath)) {
      const fs = require('fs');
      fs.unlinkSync(fullStoragePath);
    }
  }

  async getFilesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<FileResponseDto[]> {
    const files = await this.prisma.file.findMany({
      where: {
        entityType,
        entityId,
        deleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return files.map((file) => this.mapFileToResponse(file));
  }

  async createFolder(
    driveId: string,
    parentPath: string,
    name: string,
    userId: string,
  ): Promise<any> {
    // Find or create parent folder
    let parentFolder: any = null;
    if (parentPath && parentPath !== '/') {
      parentFolder = await this.prisma.folder.findFirst({
        where: {
          name: parentPath.split('/').pop(),
          // Add more conditions to find the correct parent
        },
      });
    }

    const folder = await this.prisma.folder.create({
      data: {
        name,
        parentId: parentFolder?.id,
      },
    });

    return {
      id: folder.id,
      name: folder.name,
      path: parentPath + '/' + name,
      parentId: folder.parentId,
      driveId,
      createdAt: folder.createdAt,
    };
  }

  async getOrCreateDrive(
    entityType: string,
    entityId: string,
    userId: string,
  ): Promise<any> {
    // For this implementation, we'll create a virtual drive
    // In a more complex system, you might have a Drive model
    return {
      id: `drive_${entityType}_${entityId}`,
      entityType,
      entityId,
      userId,
    };
  }

  async attachTempFiles(
    tempKey: string,
    entityType: string,
    entityId: string,
  ): Promise<{ message: string; updatedCount: number }> {
    // Update all files with the given tempKey to the new entityId
    const result = await this.prisma.file.updateMany({
      where: { 
        tempKey,
        entityType,
        deleted: false,
      },
      data: { 
        entityId,
        tempKey: null, // Clear tempKey after attaching
      },
    });

    return {
      message: `Successfully attached ${result.count} files to ${entityType}:${entityId}`,
      updatedCount: result.count,
    };
  }

  private createRelativePath(body: UploadFileDto, tempKey?: string): string {
    // If folderPath is provided, use it
    if (body.folderPath) {
      return body.folderPath.startsWith('/') ? body.folderPath.slice(1) : body.folderPath;
    }

    // Otherwise, create path based on entityType/category/entityId or tempKey
    const pathParts: string[] = [];
    
    if (body.entityType) {
      pathParts.push(body.entityType);
    }
    
    if (body.category) {
      pathParts.push(body.category);
    }
    
    if (body.entityId) {
      pathParts.push(body.entityId);
    } else if (tempKey) {
      // If no entityId but has tempKey, use temp folder
      pathParts.push('temp', tempKey);
    }

    return pathParts.length > 0 ? pathParts.join('/') : 'general';
  }

  private getFullStoragePath(relativePath: string): string {
    return join(this.uploadPath, relativePath);
  }

  private getFileTypeFromMime(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType.startsWith('video/')) return FileType.VIDEO;
    if (mimeType.startsWith('audio/')) return FileType.AUDIO;
    if (mimeType === 'application/pdf') return FileType.PDF;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
      return FileType.EXCEL;
    if (mimeType.includes('document') || mimeType.includes('text'))
      return FileType.DOCUMENT;
    return FileType.OTHER;
  }

  private mapFileToResponse(file: any): FileResponseDto {
    return {
      id: file.id,
      fileName: file.fileName,
      fileType: file.fileType,
      storeType: file.storeType,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      storagePath: file.storagePath,
      publicUrl: file.publicUrl,
      checksum: file.checksum,
      entityType: file.entityType,
      entityId: file.entityId,
      tempKey: file.tempKey,
      category: file.category,
      description: file.description,
      folderId: file.folderId,
      uploadedById: file.uploadedById,
      visibility: file.visibility,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      deleted: file.deleted,
    };
  }
}
