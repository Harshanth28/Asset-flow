import { PrismaService } from '../prisma/prisma.service';
import { CreateAllocationDto, CreateTransferRequestDto, ReturnAssetDto } from './dto/allocation.dto';
export declare class AllocationsService {
    private prisma;
    constructor(prisma: PrismaService);
    allocate(dto: CreateAllocationDto): Promise<{
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
    }>;
    findAll(): Promise<({
        department: {
            name: string;
            id: string;
        } | null;
        asset: {
            name: string;
            status: import("@prisma/client").$Enums.AssetStatus;
            id: string;
            tag: string;
        };
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
    })[]>;
    returnAsset(allocationId: string, dto: ReturnAssetDto): Promise<{
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
    }>;
    flagOverdue(): Promise<{
        flagged: number;
    }>;
    getOverdue(): Promise<({
        department: {
            name: string;
            id: string;
        } | null;
        asset: {
            name: string;
            id: string;
            tag: string;
        };
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
    })[]>;
    requestTransfer(requesterId: string, dto: CreateTransferRequestDto): Promise<{
        status: import("@prisma/client").$Enums.TransferStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        fromEmployeeId: string;
        toEmployeeId: string;
    }>;
    approveTransfer(transferId: string): Promise<{
        status: import("@prisma/client").$Enums.TransferStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        fromEmployeeId: string;
        toEmployeeId: string;
    }>;
    rejectTransfer(transferId: string): Promise<{
        status: import("@prisma/client").$Enums.TransferStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        fromEmployeeId: string;
        toEmployeeId: string;
    }>;
    getTransferRequests(): Promise<({
        asset: {
            name: string;
            id: string;
            tag: string;
        };
        fromEmployee: {
            name: string;
            email: string;
            id: string;
        };
        toEmployee: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        status: import("@prisma/client").$Enums.TransferStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        fromEmployeeId: string;
        toEmployeeId: string;
    })[]>;
}
