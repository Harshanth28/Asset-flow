import { UserStatus } from '@prisma/client';
export declare class CreateDepartmentDto {
    name: string;
    parentId?: string;
    headId?: string;
}
export declare class UpdateDepartmentDto {
    name?: string;
    parentId?: string;
    headId?: string;
    status?: UserStatus;
}
