import { AssetCondition, AssetStatus } from '@prisma/client';
export declare class CreateAssetDto {
    name: string;
    categoryId: string;
    serialNumber?: string;
    acquisitionDate?: string;
    acquisitionCost?: number;
    condition?: AssetCondition;
    location?: string;
    isBookable?: boolean;
    photoUrl?: string;
    documentUrls?: string[];
}
export declare class UpdateAssetDto {
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
