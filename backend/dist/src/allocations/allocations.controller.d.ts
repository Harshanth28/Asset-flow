import { AllocationsService } from './allocations.service';
import { CreateAllocationDto, CreateTransferRequestDto, ReturnAssetDto } from './dto/allocation.dto';
export declare class AllocationsController {
    private readonly allocationsService;
    constructor(allocationsService: AllocationsService);
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
    returnAsset(id: string, dto: ReturnAssetDto): Promise<{
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
    requestTransfer(req: any, dto: CreateTransferRequestDto): Promise<{
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
    approveTransfer(id: string): Promise<{
        status: import("@prisma/client").$Enums.TransferStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        fromEmployeeId: string;
        toEmployeeId: string;
    }>;
    rejectTransfer(id: string): Promise<{
        status: import("@prisma/client").$Enums.TransferStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        fromEmployeeId: string;
        toEmployeeId: string;
    }>;
}
