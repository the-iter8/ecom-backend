import { Schema } from "mongoose";
import { ProductDbRecord } from "../domain/type.js";

const productSchema = new Schema<ProductDbRecord>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
  },
  { collection: "products", timestamps: false },
);

export default productSchema;
