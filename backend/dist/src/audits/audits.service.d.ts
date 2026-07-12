import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditCycleDto, MarkAuditResultDto } from './dto/audit.dto';
export declare class AuditsService {
    private prisma;
    constructor(prisma: PrismaService);
    createCycle(dto: CreateAuditCycleDto): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.AuditStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        scopeType: string;
        scopeValue: string;
        startDate: Date;
        endDate: Date;
    }>;
    findAll(): Promise<({
        auditors: ({
            user: {
                name: string;
                email: string;
                id: string;
            };
        } & {
            userId: string;
            auditCycleId: string;
        })[];
        results: ({
            asset: {
                name: string;
                id: string;
                tag: string;
            };
        } & {
            status: import("@prisma/client").$Enums.AuditItemStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            assetId: string;
            auditCycleId: string;
            notes: string | null;
        })[];
    } & {
        name: string;
        status: import("@prisma/client").$Enums.AuditStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        scopeType: string;
        scopeValue: string;
        startDate: Date;
        endDate: Date;
    })[]>;
    findOne(id: string): Promise<{
        auditors: ({
            user: {
                name: string;
                email: string;
                id: string;
            };
        } & {
            userId: string;
            auditCycleId: string;
        })[];
        results: ({
            asset: {
                name: string;
                status: import("@prisma/client").$Enums.AssetStatus;
                id: string;
                tag: string;
            };
        } & {
            status: import("@prisma/client").$Enums.AuditItemStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            assetId: string;
            auditCycleId: string;
            notes: string | null;
        })[];
    } & {
        name: string;
        status: import("@prisma/client").$Enums.AuditStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        scopeType: string;
        scopeValue: string;
        startDate: Date;
        endDate: Date;
    }>;
    markResult(cycleId: string, dto: MarkAuditResultDto): Promise<{
        status: import("@prisma/client").$Enums.AuditItemStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        auditCycleId: string;
        notes: string | null;
    }>;
    getDiscrepancyReport(cycleId: string): Promise<{
        cycleId: string;
        cycleName: string;
        scope: string;
        totalFlagged: number;
        discrepancies: ({
            asset: {
                name: string;
                status: import("@prisma/client").$Enums.AssetStatus;
                id: string;
                tag: string;
                location: string | null;
            };
        } & {
            status: import("@prisma/client").$Enums.AuditItemStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            assetId: string;
            auditCycleId: string;
            notes: string | null;
        })[];
    }>;
    closeCycle(cycleId: string): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.AuditStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        scopeType: string;
        scopeValue: string;
        startDate: Date;
        endDate: Date;
    }>;
}
