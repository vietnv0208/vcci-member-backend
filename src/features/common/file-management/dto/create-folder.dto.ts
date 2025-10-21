import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({ description: 'Parent folder path' })
  @IsString()
  @IsNotEmpty()
  parentPath: string;

  @ApiProperty({ description: 'Folder name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
