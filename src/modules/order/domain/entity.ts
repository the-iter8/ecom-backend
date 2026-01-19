import { SafeParseReturnType } from "zod";
import Entity from "@lib/ddd/entity.base.js";
import { OrderProps, OrderPropsSchema, OrderItem } from "./type.js";

export default class Order extends Entity<OrderProps> {
  validate(): SafeParseReturnType<OrderProps, OrderProps> {
    return OrderPropsSchema.safeParse(this.props);
  }

  get orderNumber(): number {
    return this.props.orderNumber;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get items(): OrderItem[] {
    return [...this.props.items];
  }

  get subtotal(): number {
    return this.props.subtotal;
  }

  get discountAmount(): number {
    return this.props.discountAmount;
  }

  get totalAmount(): number {
    return this.props.totalAmount;
  }

  get discountCode(): string | undefined {
    return this.props.discountCode;
  }
}
