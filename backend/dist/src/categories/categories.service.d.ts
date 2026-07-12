import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customFields: import(".prisma/client/runtime/client").JsonValue | null;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customFields: import(".prisma/client/runtime/client").JsonValue | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customFields: import(".prisma/client/runtime/client").JsonValue | null;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customFields: import(".prisma/client/runtime/client").JsonValue | null;
    }>;
}
