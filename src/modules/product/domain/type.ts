import { z } from "zod";
import { EntityProps } from "#lib/ddd/entity.base.js";

export const ProductPropsSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().int().positive(), // Price in cents
  image: z.string().url(),
  category: z.string().min(1),
  stock: z.number().int().nonnegative(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type ProductProps = z.infer<typeof ProductPropsSchema>;

export interface ProductDbRecord {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: number;
  updatedAt: number;
}
