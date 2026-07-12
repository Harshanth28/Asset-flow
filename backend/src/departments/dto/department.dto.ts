import { UserStatus } from '@prisma/client';

export class CreateDepartmentDto {
  name!: string;
  parentId?: string;
  headId?: string;
}

export class UpdateDepartmentDto {
  name?: string;
  parentId?: string;
  headId?: string;
  status?: UserStatus;
}
