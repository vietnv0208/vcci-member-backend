import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { StreamableFile } from '@nestjs/common';

import { FilesService } from './files.service';
import { FileResponseDto, UploadFileDto, CreateFolderDto } from './dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { FileCategory } from '@prisma/client';

@ApiTags('Files')
@Controller('files')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload file directly to backend',
    description:
      'Uploads a file directly to the backend, which handles S3 upload internally',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        category: {
          type: 'string',
          enum: Object.values(FileCategory),
          description: 'File category',
        },
        entityId: {
          type: 'string',
          description: 'ID of the entity this file belongs to',
        },
        entityType: {
          type: 'string',
          description: 'Type of entity this file belongs to',
        },
        folderPath: {
          type: 'string',
          description:
            'Target folder path for upload (e.g., /Documents/Projects)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Validation error or file type not allowed',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      category?: FileCategory;
      entityId?: string;
      entityType?: string;
      folderPath?: string;
    },
  ): Promise<FileResponseDto> {
    return this.filesService.uploadFile(file, body, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get file information',
    description: 'Retrieves file metadata by ID',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File information retrieved',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async getFile(@Param('id') fileId: string): Promise<FileResponseDto> {
    return this.filesService.getFile(fileId);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Download file',
    description: 'Streams the file content directly from the server',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File content streamed',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async downloadFile(
    @Param('id') fileId: string,
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ): Promise<StreamableFile> {
    return this.filesService.downloadFile(fileId, res, req.user.userId);
  }

  @Get(':id/download-url')
  @ApiOperation({
    summary: 'Download file url',
    description: 'Get download URL for the file',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'Download URL retrieved',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: {
          type: 'string',
          description: 'Download URL for the file',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async downloadFileUrl(
    @Param('id') fileId: string,
    @Request() req,
  ): Promise<{ downloadUrl: string }> {
    return this.filesService.getDownloadUrl(fileId, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete file',
    description: 'Deletes the file from both storage and the database',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async deleteFile(@Param('id') fileId: string): Promise<void> {
    return this.filesService.deleteFile(fileId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get files by entity',
    description: 'Retrieves all files associated with a specific entity',
  })
  @ApiQuery({
    name: 'entityType',
    description: 'Type of entity (e.g., User, LeaveRequest)',
  })
  @ApiQuery({ name: 'entityId', description: 'ID of the entity' })
  @ApiResponse({
    status: 200,
    description: 'Files retrieved successfully',
    type: [FileResponseDto],
  })
  async getFilesByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ): Promise<FileResponseDto[]> {
    return this.filesService.getFilesByEntity(entityType, entityId);
  }

  @Post('drives/:entityType/:entityId/folders')
  @ApiOperation({
    summary: 'Create folder',
    description: 'Creates a new folder in the specified drive',
  })
  @ApiParam({ name: 'entityType', description: 'Type of entity' })
  @ApiParam({ name: 'entityId', description: 'ID of the entity' })
  @ApiResponse({
    status: 201,
    description: 'Folder created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        path: { type: 'string' },
        parentId: { type: 'string' },
        driveId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async createFolder(
    @Request() req,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() body: CreateFolderDto,
  ): Promise<any> {
    const drive = await this.filesService.getOrCreateDrive(
      entityType,
      entityId,
      req.user.userId,
    );
    return this.filesService.createFolder(
      drive.id,
      body.parentPath,
      body.name,
      req.user.userId,
    );
  }
}
