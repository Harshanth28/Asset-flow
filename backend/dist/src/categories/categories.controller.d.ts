import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<{
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
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customFields: import(".prisma/client/runtime/client").JsonValue | null;
    }>;
}
