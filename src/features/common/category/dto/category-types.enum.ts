import { CategoryType } from "@prisma/client";

export { CategoryType } from '@prisma/client';

export const CategoryTypeLabels: Record<CategoryType, string> = {
  [CategoryType.ORGANIZATION_TYPE]: 'Loại hình tổ chức',
};

export const CategoryParentRules: Record<CategoryType, CategoryType | null> = {
  [CategoryType.ORGANIZATION_TYPE]: null,
};
