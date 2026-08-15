import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { AuthenticatedUser } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Patient Self-Registration with Atomic Prisma Transaction.
   */
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('A user account with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
          role: UserRole.PATIENT,
        },
      });

      const patient = await tx.patient.create({
        data: {
          userId: user.id,
        },
      });

      return { user, patient };
    });

    const tokens = await this.generateTokenPair(result.user.id, result.user.email, result.user.role);

    return {
      message: 'User registered successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        patientId: result.patient.id,
      },
      ...tokens,
    };
  }

  /**
   * Authenticate user with bcrypt verification.
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { patient: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const tokens = await this.generateTokenPair(user.id, user.email, user.role);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        patientId: user.patient?.id || null,
      },
      ...tokens,
    };
  }

  /**
   * Single-use Refresh Token Rotation with Revocation.
   */
  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    let payload: any;
    try {
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET') || 'careflow_super_secret_refresh_key_2026';
      payload = this.jwtService.verify(rawRefreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { refreshTokens: true },
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists.');
    }

    // SHA-256 hash raw token to avoid bcrypt 72-byte truncation
    const safeHashedToken = this.hashToken(rawRefreshToken);

    // Find active refresh token in database
    let matchedTokenRecord: any = null;
    for (const record of user.refreshTokens) {
      const match = await bcrypt.compare(safeHashedToken, record.tokenHash);
      if (match) {
        matchedTokenRecord = record;
        break;
      }
    }

    if (!matchedTokenRecord) {
      throw new UnauthorizedException('Refresh token not recognized.');
    }

    // Reuse detection: If token was already revoked, revoke all tokens for this user
    if (matchedTokenRecord.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected. Revoking session.');
    }

    if (new Date() > matchedTokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token expired.');
    }

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: matchedTokenRecord.id },
      data: { revokedAt: new Date() },
    });

    // Issue rotated token pair
    const tokens = await this.generateTokenPair(user.id, user.email, user.role);
    return tokens;
  }

  /**
   * Logout user by revoking refresh tokens.
   */
  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logout successful' };
  }

  /**
   * Return authenticated current user profile.
   */
  async getMe(user: AuthenticatedUser) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      patientId: user.patientId,
    };
  }

  /**
   * Internal helper to generate Access & Refresh token pair.
   */
  private async generateTokenPair(userId: string, email: string, role: string) {
    const accessSecret =
      this.configService.get<string>('JWT_SECRET') || 'careflow_super_secret_jwt_key_change_in_production_2026';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || 'careflow_super_secret_refresh_key_2026';

    const accessExpiry = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const accessToken = this.jwtService.sign(
      { sub: userId, email, role },
      { secret: accessSecret, expiresIn: accessExpiry },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh', jti: crypto.randomUUID() },
      { secret: refreshSecret, expiresIn: refreshExpiry },
    );

    // Hash SHA-256 pre-hashed token with bcrypt to fit within bcrypt 72-byte limit
    const safeHashedToken = this.hashToken(refreshToken);
    const tokenHash = await bcrypt.hash(safeHashedToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
