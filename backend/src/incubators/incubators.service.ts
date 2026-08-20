import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { CreateIncubatorDto } from './dto/create-incubator.dto';

@Injectable()
export class IncubatorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateIncubatorDto) {
    try {
      return await this.prisma.incubator.create({
        data: { ...input, status: 'AVAILABLE' },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          'Ya existe una incubadora con ese código o número de serie.',
        );
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.incubator.findMany({ orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const incubator = await this.prisma.incubator.findUnique({ where: { id } });
    if (!incubator) throw new NotFoundException('Incubator not found');
    return incubator;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: unknown }).code === 'P2002'
    );
  }
}
