import { Schema } from "mongoose";
import { CartDbRecord, CartItem } from "../domain/type.js";

const cartItemSchema = new Schema<CartItem>(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    priceSnapshot: { type: Number, required: true },
  },
  { _id: false },
);

const cartSchema = new Schema<CartDbRecord>(
  {
    _id: { type: String, required: true },
    customerId: { type: String, required: true, index: true },
    items: { type: [cartItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
  },
  { collection: "carts", timestamps: false },
);

export default cartSchema;
