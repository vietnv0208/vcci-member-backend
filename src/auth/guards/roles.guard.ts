import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    this.logger.debug(`Required roles: ${requiredRoles.join(', ')}`);
    this.logger.debug(`User role: ${user?.role || 'undefined'}`);

    if (!user || !user.role) {
      this.logger.warn('Access denied: User or user role not found');
      return false;
    }
    
    const hasRole = requiredRoles.some((role) => user.role === role);
    this.logger.debug(`Access ${hasRole ? 'granted' : 'denied'} for user ${user.email}`);
    
    return hasRole;
  }
}
