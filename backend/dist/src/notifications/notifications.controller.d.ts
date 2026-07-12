import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findForUser(req: any): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        title: string;
        message: string;
        isRead: boolean;
    }[]>;
    markRead(id: string): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    markAllRead(req: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
