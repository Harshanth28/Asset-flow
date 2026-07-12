import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.assetCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Category name already exists');
    }

    return this.prisma.assetCategory.create({
      data: {
        name: dto.name,
        customFields: dto.customFields || {},
      },
    });
  }

  async findAll() {
    return this.prisma.assetCategory.findMany();
  }

  async findOne(id: string) {
    const cat = await this.prisma.assetCategory.findUnique({
      where: { id },
    });
    if (!cat) {
      throw new NotFoundException('Category not found');
    }
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.prisma.assetCategory.findUnique({ where: { id } });
    if (!cat) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.assetCategory.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : undefined,
        customFields:
          dto.customFields !== undefined ? dto.customFields : undefined,
      },
    });
  }
}
