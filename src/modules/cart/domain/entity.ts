import { SafeParseReturnType } from "zod";
import Entity from "#lib/ddd/entity.base.js";
import { CartProps, CartPropsSchema, CartItem } from "./type.js";

export default class Cart extends Entity<CartProps> {
  validate(): SafeParseReturnType<CartProps, CartProps> {
    return CartPropsSchema.safeParse(this.props);
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get items(): CartItem[] {
    return [...this.props.items];
  }

  get totalAmount(): number {
    return this.props.totalAmount;
  }

  addItem(productId: string, quantity: number, priceSnapshot: number): void {
    const existingItemIndex = this.props.items.findIndex(
      (item) => item.productId === productId,
    );

    if (existingItemIndex >= 0) {
      this.props.items[existingItemIndex].quantity += quantity;
    } else {
      this.props.items.push({ productId, quantity, priceSnapshot });
    }

    this.recalculateTotal();
    this.props.updatedAt = Date.now();
  }

  updateItemQuantity(productId: string, quantity: number): void {
    const itemIndex = this.props.items.findIndex(
      (item) => item.productId === productId,
    );

    if (itemIndex >= 0) {
      this.props.items[itemIndex].quantity = quantity;
      this.recalculateTotal();
      this.props.updatedAt = Date.now();
    }
  }

  removeItem(productId: string): void {
    this.props.items = this.props.items.filter(
      (item) => item.productId !== productId,
    );
    this.recalculateTotal();
    this.props.updatedAt = Date.now();
  }

  clearItems(): void {
    this.props.items = [];
    this.props.totalAmount = 0;
    this.props.updatedAt = Date.now();
  }

  private recalculateTotal(): void {
    this.props.totalAmount = this.props.items.reduce(
      (sum, item) => sum + item.quantity * item.priceSnapshot,
      0,
    );
  }
}
