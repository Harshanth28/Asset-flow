export declare class CreateAuditCycleDto {
    name: string;
    scopeType: 'department' | 'location';
    scopeValue: string;
    startDate: string;
    endDate: string;
    auditorIds: string[];
}
export declare class MarkAuditResultDto {
    assetId: string;
    status: 'VERIFIED' | 'MISSING' | 'DAMAGED';
    notes?: string;
}
