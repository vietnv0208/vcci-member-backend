import { ActivityActionType } from '../enums/activity-action-type.enum';
import { ActivityTargetType } from '../enums/activity-target-type.enum';

export interface ActivityLogData {
  action: ActivityActionType;
  title: string;
  description?: string;
  targetType?: ActivityTargetType;
  targetId?: string;
  userId?: string;
  requestData?: any;
  responseData?: any;
  ipAddress?: string;
}

export interface ActivityLogTemplate {
  title: string;
  description: string;
}

export interface ActivityLogContext {
  [key: string]: any;
}
