import { SafeParseReturnType } from "zod";
import Entity from "#lib/ddd/entity.base.js";
import { DiscountCodeProps, DiscountCodePropsSchema } from "./type.js";

export default class DiscountCode extends Entity<DiscountCodeProps> {
  validate(): SafeParseReturnType<DiscountCodeProps, DiscountCodeProps> {
    return DiscountCodePropsSchema.safeParse(this.props);
  }

  get code(): string {
    return this.props.code;
  }

  get isUsed(): boolean {
    return this.props.isUsed;
  }

  get generatedAtOrderNumber(): number {
    return this.props.generatedAtOrderNumber;
  }

  get discountPercent(): number {
    return this.props.discountPercent;
  }

  markAsUsed(): void {
    this.props.isUsed = true;
    this.props.updatedAt = Date.now();
  }

  canBeUsed(): boolean {
    return !this.props.isUsed;
  }
}
