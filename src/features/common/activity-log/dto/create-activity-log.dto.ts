import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { ActivityActionType } from '../enums/activity-action-type.enum';
import { ActivityTargetType } from '../enums/activity-target-type.enum';

export class CreateActivityLogDto {
  @IsEnum(ActivityActionType)
  action: ActivityActionType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ActivityTargetType)
  targetType?: ActivityTargetType;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsObject()
  requestData?: any;

  @IsOptional()
  @IsObject()
  responseData?: any;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
