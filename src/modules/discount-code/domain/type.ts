import { z } from "zod";

export const DiscountCodePropsSchema = z.object({
  id: z.string(),
  code: z.string(),
  isUsed: z.boolean(),
  generatedAtOrderNumber: z.number().int().positive(),
  discountPercent: z.number().int().positive().max(100),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type DiscountCodeProps = z.infer<typeof DiscountCodePropsSchema>;

export interface DiscountCodeDbRecord {
  _id: string;
  code: string;
  isUsed: boolean;
  generatedAtOrderNumber: number;
  discountPercent: number;
  createdAt: number;
  updatedAt: number;
}
