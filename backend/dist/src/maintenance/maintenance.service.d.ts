import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto, AssignTechnicianDto } from './dto/maintenance.dto';
export declare class MaintenanceService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateMaintenanceDto): Promise<{
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
    }>;
    findAll(): Promise<({
        user: {
            name: string;
            email: string;
            id: string;
        };
        asset: {
            name: string;
            id: string;
            tag: string;
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
    })[]>;
    findOne(id: string): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
        };
        asset: {
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
    }>;
    approve(id: string): Promise<{
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
    }>;
    reject(id: string): Promise<{
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
    }>;
    assignTechnician(id: string, dto: AssignTechnicianDto): Promise<{
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
    }>;
    resolve(id: string): Promise<{
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
    }>;
}
