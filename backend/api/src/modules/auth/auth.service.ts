import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: '$2b$10$dummyhashedpassword',
        role: dto.role || 'PATIENT',
        patient: dto.role === 'PATIENT' ? { create: {} } : undefined,
      },
    });

    return {
      message: 'Registration successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken: `mock_jwt_token_${user.id}`,
    };
  }

  async login(dto: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken: `mock_jwt_token_${user.id}`,
    };
  }

  async refresh(token: string) {
    return {
      accessToken: `mock_jwt_token_refreshed_${Date.now()}`,
    };
  }
}
