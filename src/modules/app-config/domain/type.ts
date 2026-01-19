import { z } from "zod";

export const AppConfigPropsSchema = z.object({
  id: z.string(),
  key: z.string(),
  nthOrderValue: z.number().int().positive(),
  totalOrderCount: z.number().int().nonnegative(),
  discountPercent: z.number().int().positive().max(100),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type AppConfigProps = z.infer<typeof AppConfigPropsSchema>;

export interface AppConfigDbRecord {
  _id: string;
  key: string;
  nthOrderValue: number;
  totalOrderCount: number;
  discountPercent: number;
  createdAt: number;
  updatedAt: number;
}
