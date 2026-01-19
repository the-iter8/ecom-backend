import { Schema } from "mongoose";
import { OrderDbRecord, OrderItem } from "../domain/type.js";

const orderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDbRecord>(
  {
    _id: { type: String, required: true },
    orderNumber: { type: Number, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },
    discountCode: { type: String },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
  },
  { collection: "orders", timestamps: false },
);

export default orderSchema;
