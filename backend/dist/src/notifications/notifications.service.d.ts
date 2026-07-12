import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, title: string, message: string): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    findForUser(userId: string): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        title: string;
        message: string;
        isRead: boolean;
    }[]>;
    markRead(notificationId: string): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    markAllRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
