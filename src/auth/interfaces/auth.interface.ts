import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: number;
  username: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    role: Role;
    email?: string;
    department?: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
