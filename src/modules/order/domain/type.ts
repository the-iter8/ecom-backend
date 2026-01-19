import { z } from "zod";

export const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().int().positive(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderPropsSchema = z.object({
  id: z.string(),
  orderNumber: z.number().int().positive(),
  customerId: z.string(),
  items: z.array(OrderItemSchema),
  subtotal: z.number().int().nonnegative(),
  discountAmount: z.number().int().nonnegative(),
  totalAmount: z.number().int().nonnegative(),
  discountCode: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type OrderProps = z.infer<typeof OrderPropsSchema>;

export interface OrderDbRecord {
  _id: string;
  orderNumber: number;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  discountCode?: string;
  createdAt: number;
  updatedAt: number;
}
