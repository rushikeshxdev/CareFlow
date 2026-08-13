import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';
import { ProviderType } from '@prisma/client';

export interface ProviderQueryDto {
  providerType?: ProviderType;
  specialtyId?: string;
  city?: string;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sortBy?: 'score' | 'rating' | 'price' | 'experience';
}

@Injectable()
export class ProvidersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(query: ProviderQueryDto) {
    const cacheKey = `providers:search:${JSON.stringify(query)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const { providerType, specialtyId, city, maxPrice, minRating, search, sortBy = 'score' } = query;

    const where: any = {};

    if (providerType) {
      where.type = providerType;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (maxPrice) {
      where.consultationFee = { lte: Number(maxPrice) };
    }

    if (minRating) {
      where.rating = { gte: Number(minRating) };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (specialtyId) {
      where.specialties = {
        some: { specialtyId },
      };
    }

    const providers = await this.prisma.provider.findMany({
      where,
      include: {
        specialties: {
          include: {
            specialty: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        availabilitySlots: {
          where: {
            status: 'AVAILABLE',
            startTime: { gte: new Date() },
          },
          take: 5,
          orderBy: { startTime: 'asc' },
        },
      },
    });

    // Calculate deterministic score for each provider
    const scoredProviders = providers.map((provider) => {
      const score = this.calculateProviderScore(provider, specialtyId);
      return {
        ...provider,
        matchScore: Number(score.toFixed(2)),
      };
    });

    // Sort providers
    if (sortBy === 'rating') {
      scoredProviders.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price') {
      scoredProviders.sort((a, b) => a.consultationFee - b.consultationFee);
    } else if (sortBy === 'experience') {
      scoredProviders.sort((a, b) => b.experienceYears - a.experienceYears);
    } else {
      // Default: Sort by calculated matchScore
      scoredProviders.sort((a, b) => b.matchScore - a.matchScore);
    }

    // Cache results for 60 seconds
    await this.redis.set(cacheKey, JSON.stringify(scoredProviders), 60);

    return scoredProviders;
  }

  async findOne(id: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      include: {
        specialties: {
          include: { specialty: true },
        },
        services: {
          include: { service: true },
        },
        availabilitySlots: {
          where: {
            startTime: { gte: new Date() },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID "${id}" not found`);
    }

    return provider;
  }

  /**
   * Deterministic Provider Ranking Scoring Formula
   * Score = (Specialty Match * 0.35) + (Rating * 0.25) + (Availability * 0.20) + (Experience * 0.10) + (Price Match * 0.10)
   */
  private calculateProviderScore(provider: any, requestedSpecialtyId?: string): number {
    let specialtyScore = 0.5;
    if (requestedSpecialtyId) {
      const hasSpecialty = provider.specialties.some((s: any) => s.specialtyId === requestedSpecialtyId);
      specialtyScore = hasSpecialty ? 1.0 : 0.2;
    } else {
      specialtyScore = 0.8;
    }

    const ratingScore = Math.min(provider.rating / 5.0, 1.0);

    const hasSlots = provider.availabilitySlots && provider.availabilitySlots.length > 0;
    const availabilityScore = hasSlots ? 1.0 : 0.3;

    const experienceScore = Math.min(provider.experienceYears / 20.0, 1.0);

    const priceScore = Math.max(1.0 - provider.consultationFee / 300.0, 0.1);

    const finalScore =
      specialtyScore * 0.35 +
      ratingScore * 0.25 +
      availabilityScore * 0.20 +
      experienceScore * 0.10 +
      priceScore * 0.10;

    return Math.min(Math.max(finalScore * 100, 0), 100);
  }
}
