import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: string;
    department?: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
