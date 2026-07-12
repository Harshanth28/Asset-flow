export declare class CreateMaintenanceDto {
    assetId: string;
    description: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    photoUrl?: string;
}
export declare class AssignTechnicianDto {
    technician: string;
}
