import { SafeParseReturnType } from "zod";
import Entity from "#lib/ddd/entity.base.js";
import { ProductProps, ProductPropsSchema } from "./type.js";

export default class Product extends Entity<ProductProps> {
  validate(): SafeParseReturnType<ProductProps, ProductProps> {
    return ProductPropsSchema.safeParse(this.props);
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get price(): number {
    return this.props.price;
  }

  get image(): string {
    return this.props.image;
  }

  get category(): string {
    return this.props.category;
  }

  get stock(): number {
    return this.props.stock;
  }

  reduceStock(quantity: number): void {
    if (this.props.stock < quantity) {
      throw new Error("Insufficient stock");
    }
    this.props.stock -= quantity;
    this.props.updatedAt = Date.now();
  }

  increaseStock(quantity: number): void {
    this.props.stock += quantity;
    this.props.updatedAt = Date.now();
  }

  updatePrice(price: number): void {
    this.props.price = price;
    this.props.updatedAt = Date.now();
  }
}
