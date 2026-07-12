import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(createDeptDto: CreateDepartmentDto): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        headId: string | null;
        parentId: string | null;
    }>;
    findAll(): Promise<({
        head: {
            name: string;
            email: string;
            id: string;
        } | null;
        parent: {
            name: string;
            id: string;
        } | null;
        children: {
            name: string;
            id: string;
        }[];
    } & {
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        headId: string | null;
        parentId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        head: {
            name: string;
            email: string;
            id: string;
        } | null;
        parent: {
            name: string;
            status: import("@prisma/client").$Enums.UserStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            headId: string | null;
            parentId: string | null;
        } | null;
        children: {
            name: string;
            status: import("@prisma/client").$Enums.UserStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            headId: string | null;
            parentId: string | null;
        }[];
        employees: {
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
        }[];
    } & {
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        headId: string | null;
        parentId: string | null;
    }>;
    update(id: string, updateDeptDto: UpdateDepartmentDto): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        headId: string | null;
        parentId: string | null;
    }>;
    deactivate(id: string): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        headId: string | null;
        parentId: string | null;
    }>;
}
