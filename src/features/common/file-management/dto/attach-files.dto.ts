import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AttachFilesDto {
  @ApiProperty({ 
    description: 'Temporary key to identify files to attach',
    example: 'temp_abc123'
  })
  @IsString()
  @IsNotEmpty()
  tempKey: string;

  @ApiProperty({ 
    description: 'Type of entity to attach files to',
    example: 'MEMBER'
  })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({ 
    description: 'ID of the entity to attach files to',
    example: 'uuid-member-id'
  })
  @IsString()
  @IsNotEmpty()
  entityId: string;
}

export class AttachFilesResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Number of files updated' })
  updatedCount: number;
}
