import { PrismaService } from '../prisma/prisma.service';
export declare class LogsService {
    private prisma;
    constructor(prisma: PrismaService);
    log(userId: string, action: string, details: string): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        action: string;
        details: string;
    }>;
    findAll(): Promise<({
        user: {
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
        };
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        action: string;
        details: string;
    })[]>;
    findForUser(userId: string): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        action: string;
        details: string;
    }[]>;
}
