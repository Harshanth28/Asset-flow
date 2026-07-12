import { Role, UserStatus } from '@prisma/client';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class PromoteUserDto {
    userId: string;
    role: Role;
}
export declare class UpdateUserDto {
    name?: string;
    departmentId?: string;
    status?: UserStatus;
}
