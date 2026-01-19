import { Schema } from "mongoose";
import { DiscountCodeDbRecord } from "../domain/type.js";

const discountCodeSchema = new Schema<DiscountCodeDbRecord>(
  {
    _id: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    isUsed: { type: Boolean, required: true, default: false },
    generatedAtOrderNumber: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
  },
  { collection: "discountCodes", timestamps: false },
);

export default discountCodeSchema;
