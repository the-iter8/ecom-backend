import { SafeParseReturnType } from "zod";
import Entity from "#lib/ddd/entity.base.js";
import { AppConfigProps, AppConfigPropsSchema } from "./type.js";

export default class AppConfig extends Entity<AppConfigProps> {
  validate(): SafeParseReturnType<AppConfigProps, AppConfigProps> {
    return AppConfigPropsSchema.safeParse(this.props);
  }

  get key(): string {
    return this.props.key;
  }

  get nthOrderValue(): number {
    return this.props.nthOrderValue;
  }

  get totalOrderCount(): number {
    return this.props.totalOrderCount;
  }

  get discountPercent(): number {
    return this.props.discountPercent;
  }

  incrementOrderCount(): number {
    this.props.totalOrderCount += 1;
    this.props.updatedAt = Date.now();
    return this.props.totalOrderCount;
  }

  shouldGenerateDiscount(): boolean {
    return this.props.totalOrderCount % this.props.nthOrderValue === 0;
  }

  canGenerateDiscountNow(): boolean {
    return (this.props.totalOrderCount + 1) % this.props.nthOrderValue === 0;
  }

  updateNthValue(value: number): void {
    this.props.nthOrderValue = value;
    this.props.updatedAt = Date.now();
  }
}
