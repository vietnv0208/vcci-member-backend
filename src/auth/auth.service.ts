import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  JwtPayload,
  AuthResponse,
  RefreshTokenResponse,
} from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        fullName: true,
        role: true,
        email: true,
        department: true,
        active: true,
        deleted: true,
      },
    });

    if (user && user.active && !user.deleted) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Clean up existing refresh tokens for this user (optional: limit concurrent sessions)
    await this.cleanupExpiredRefreshTokens(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshTokenValue = this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Calculate expiration date for refresh token
    const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    const expiresAt = new Date();
    
    // Parse the expiration time (e.g., "7d", "1h", "30m")
    const timeValue = parseInt(refreshTokenExpiresIn);
    const timeUnit = refreshTokenExpiresIn.slice(-1);
    
    switch (timeUnit) {
      case 'd':
        expiresAt.setDate(expiresAt.getDate() + timeValue);
        break;
      case 'h':
        expiresAt.setHours(expiresAt.getHours() + timeValue);
        break;
      case 'm':
        expiresAt.setMinutes(expiresAt.getMinutes() + timeValue);
        break;
      default:
        expiresAt.setDate(expiresAt.getDate() + 7); // Default to 7 days
    }

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt,
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        department: user.department,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      // First verify the JWT token structure
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      });

      // Check if refresh token exists in database and is not expired
      const storedRefreshToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
              active: true,
              deleted: true,
            },
          },
        },
      });

      if (!storedRefreshToken || storedRefreshToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token not found or expired');
      }

      const user = storedRefreshToken.user;
      if (!user || !user.active || user.deleted) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      });

      const newRefreshTokenValue = this.jwtService.sign(newPayload, {
        expiresIn:
          this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      });

      // Calculate new expiration date
      const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
      const expiresAt = new Date();
      
      const timeValue = parseInt(refreshTokenExpiresIn);
      const timeUnit = refreshTokenExpiresIn.slice(-1);
      
      switch (timeUnit) {
        case 'd':
          expiresAt.setDate(expiresAt.getDate() + timeValue);
          break;
        case 'h':
          expiresAt.setHours(expiresAt.getHours() + timeValue);
          break;
        case 'm':
          expiresAt.setMinutes(expiresAt.getMinutes() + timeValue);
          break;
        default:
          expiresAt.setDate(expiresAt.getDate() + 7);
      }

      // Delete old refresh token and create new one
      await this.prisma.refreshToken.delete({
        where: { id: storedRefreshToken.id },
      });

      await this.prisma.refreshToken.create({
        data: {
          token: newRefreshTokenValue,
          userId: user.id,
          expiresAt,
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenValue,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async logout(userId: number, refreshToken?: string): Promise<{ message: string }> {
    if (refreshToken) {
      // Revoke specific refresh token
      await this.prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken,
          userId: userId,
        },
      });
    } else {
      // Revoke all refresh tokens for the user
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId: userId,
        },
      });
    }
    
    return { message: 'Logged out successfully' };
  }

  async revokeRefreshToken(refreshToken: string): Promise<{ message: string }> {
    try {
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
      return { message: 'Refresh token revoked successfully' };
    } catch (error) {
      throw new UnauthorizedException('Refresh token not found');
    }
  }

  async revokeAllUserRefreshTokens(userId: number): Promise<{ message: string }> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId: userId },
    });
    return { message: 'All refresh tokens revoked successfully' };
  }

  async cleanupExpiredRefreshTokens(userId?: number): Promise<void> {
    const whereCondition: any = {
      expiresAt: {
        lt: new Date(),
      },
    };

    if (userId) {
      whereCondition.userId = userId;
    }

    await this.prisma.refreshToken.deleteMany({
      where: whereCondition,
    });
  }

  async getUserRefreshTokens(userId: number): Promise<any[]> {
    return this.prisma.refreshToken.findMany({
      where: { userId: userId },
      select: {
        id: true,
        token: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createDefaultSuperAdmin(): Promise<void> {
    const existingUser = await this.prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('123!@#', 10);

      await this.prisma.user.create({
        data: {
          username: 'superadmin',
          password: hashedPassword,
          fullName: 'Super Administrator',
          role: 'SUPER_ADMIN',
          email: 'admin@detech.com',
          department: 'IT',
          active: true,
        },
      });

      console.log('✅ Default super admin user created successfully');
      console.log('📧 Username: superadmin');
      console.log('🔑 Password: 123!@#');
    }
  }
}
