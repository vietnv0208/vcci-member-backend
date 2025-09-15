import { UserRole } from '@prisma/client';

// Re-export Prisma UserRole as our Role enum for RBAC
export const Role = UserRole;
export type Role = UserRole;
