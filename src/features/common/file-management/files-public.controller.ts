import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { StreamableFile } from '@nestjs/common';

import { FilesService } from './files.service';
import { FileResponseDto, AttachFilesDto, AttachFilesResponseDto } from './dto';
import { FileCategory } from '@prisma/client';

@ApiTags('Public Files')
@Controller('public/files')
export class FilesPublicController {
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
    // @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      category?: FileCategory;
      entityId?: string;
      entityType?: string;
      folderPath?: string;
    },
  ): Promise<FileResponseDto> {
    return this.filesService.uploadFile(file, body,undefined);
  }

  @Post('attach')
  @ApiOperation({
    summary: 'Attach temporary files to entity',
    description: 'Attach files uploaded with tempKey to a specific entity',
  })
  @ApiResponse({
    status: 200,
    description: 'Files attached successfully',
    type: AttachFilesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No files found with the given tempKey',
  })
  async attachTempFiles(
    @Body() attachFilesDto: AttachFilesDto,
  ): Promise<AttachFilesResponseDto> {
    return this.filesService.attachTempFiles(
      attachFilesDto.tempKey,
      attachFilesDto.entityType,
      attachFilesDto.entityId,
    );
  }
}
