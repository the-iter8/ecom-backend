import { Schema } from "mongoose";
import { AppConfigDbRecord } from "../domain/type.js";

const appConfigSchema = new Schema<AppConfigDbRecord>(
  {
    _id: { type: String, required: true },
    key: { type: String, required: true, unique: true, index: true },
    nthOrderValue: { type: Number, required: true },
    totalOrderCount: { type: Number, required: true, default: 0 },
    discountPercent: { type: Number, required: true },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
  },
  { collection: "appConfig", timestamps: false },
);

export default appConfigSchema;
