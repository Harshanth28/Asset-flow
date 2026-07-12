export class CreateCategoryDto {
  name!: string;
  customFields?: Record<string, any>;
}

export class UpdateCategoryDto {
  name?: string;
  customFields?: Record<string, any>;
}
