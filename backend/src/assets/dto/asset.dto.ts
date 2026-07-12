import { AssetCondition, AssetStatus } from '@prisma/client';

export class CreateAssetDto {
  name!: string;
  categoryId!: string;
  serialNumber?: string;
  acquisitionDate?: string;
  acquisitionCost?: number;
  condition?: AssetCondition;
  location?: string;
  isBookable?: boolean;
  photoUrl?: string;
  documentUrls?: string[];
}

export class UpdateAssetDto {
  name?: string;
  categoryId?: string;
  serialNumber?: string;
  acquisitionDate?: string;
  acquisitionCost?: number;
  condition?: AssetCondition;
  location?: string;
  isBookable?: boolean;
  status?: AssetStatus;
  photoUrl?: string;
  documentUrls?: string[];
}
