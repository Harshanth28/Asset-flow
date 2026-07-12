import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { AssetStatus } from '@prisma/client';
export declare class AssetsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAssetDto): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.AssetStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tag: string;
        serialNumber: string | null;
        acquisitionDate: Date;
        acquisitionCost: number;
        condition: import("@prisma/client").$Enums.AssetCondition;
        location: string | null;
        isBookable: boolean;
        photoUrl: string | null;
        documentUrls: string[];
        categoryId: string;
    }>;
    findAll(filters: {
        search?: string;
        categoryId?: string;
        status?: AssetStatus;
        location?: string;
        departmentId?: string;
    }): Promise<({
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customFields: import(".prisma/client/runtime/client").JsonValue | null;
        };
    } & {
        name: string;
        status: import("@prisma/client").$Enums.AssetStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tag: string;
        serialNumber: string | null;
        acquisitionDate: Date;
        acquisitionCost: number;
        condition: import("@prisma/client").$Enums.AssetCondition;
        location: string | null;
        isBookable: boolean;
        photoUrl: string | null;
        documentUrls: string[];
        categoryId: string;
    })[]>;
    findOne(id: string): Promise<{
        allocations: ({
            department: {
                name: string;
                id: string;
            } | null;
            employee: {
                name: string;
                email: string;
                id: string;
            } | null;
        } & {
            departmentId: string | null;
            status: import("@prisma/client").$Enums.AllocationStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            assetId: string;
            employeeId: string | null;
            assignedDate: Date;
            expectedReturnDate: Date | null;
            actualReturnDate: Date | null;
            checkInNotes: string | null;
        })[];
        maintenance: ({
            user: {
                name: string;
                id: string;
            };
        } & {
            userId: string;
            status: import("@prisma/client").$Enums.MaintenanceStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            photoUrl: string | null;
            assetId: string;
            description: string;
            priority: import("@prisma/client").$Enums.MaintenancePriority;
            technician: string | null;
        })[];
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customFields: import(".prisma/client/runtime/client").JsonValue | null;
        };
    } & {
        name: string;
        status: import("@prisma/client").$Enums.AssetStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tag: string;
        serialNumber: string | null;
        acquisitionDate: Date;
        acquisitionCost: number;
        condition: import("@prisma/client").$Enums.AssetCondition;
        location: string | null;
        isBookable: boolean;
        photoUrl: string | null;
        documentUrls: string[];
        categoryId: string;
    }>;
    update(id: string, dto: UpdateAssetDto): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.AssetStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tag: string;
        serialNumber: string | null;
        acquisitionDate: Date;
        acquisitionCost: number;
        condition: import("@prisma/client").$Enums.AssetCondition;
        location: string | null;
        isBookable: boolean;
        photoUrl: string | null;
        documentUrls: string[];
        categoryId: string;
    }>;
    remove(id: string): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.AssetStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tag: string;
        serialNumber: string | null;
        acquisitionDate: Date;
        acquisitionCost: number;
        condition: import("@prisma/client").$Enums.AssetCondition;
        location: string | null;
        isBookable: boolean;
        photoUrl: string | null;
        documentUrls: string[];
        categoryId: string;
    }>;
}
