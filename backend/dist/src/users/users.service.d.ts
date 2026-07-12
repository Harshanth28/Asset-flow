import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, LoginDto, PromoteUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
export declare class UsersService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    signup(dto: CreateUserDto): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        departmentId: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            status: import("@prisma/client").$Enums.UserStatus;
        };
    }>;
    promote(dto: PromoteUserDto): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        departmentId: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        departmentId: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deactivate(id: string): Promise<{
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        departmentId: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getDirectory(): Promise<{
        department: {
            name: string;
            id: string;
        } | null;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
    }[]>;
    findOne(id: string): Promise<{
        department: {
            name: string;
            status: import("@prisma/client").$Enums.UserStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            headId: string | null;
            parentId: string | null;
        } | null;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        departmentId: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
