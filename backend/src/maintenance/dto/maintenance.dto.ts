export class CreateMaintenanceDto {
  assetId!: string;
  description!: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  photoUrl?: string;
}

export class AssignTechnicianDto {
  technician!: string;
}
