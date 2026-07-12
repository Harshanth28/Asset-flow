import { AuditsService } from './audits.service';
import { CreateAuditCycleDto, MarkAuditResultDto } from './dto/audit.dto';
export declare class AuditsController {
    private readonly auditsService;
    constructor(auditsService: AuditsService);
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
    markResult(id: string, dto: MarkAuditResultDto): Promise<{
        status: import("@prisma/client").$Enums.AuditItemStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        auditCycleId: string;
        notes: string | null;
    }>;
    getDiscrepancyReport(id: string): Promise<{
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
    closeCycle(id: string): Promise<{
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
