import { z } from "zod";

export const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  priceSnapshot: z.number().int().positive(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const CartPropsSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  items: z.array(CartItemSchema),
  totalAmount: z.number().int().nonnegative(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type CartProps = z.infer<typeof CartPropsSchema>;

export interface CartDbRecord {
  _id: string;
  customerId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: number;
  updatedAt: number;
}
