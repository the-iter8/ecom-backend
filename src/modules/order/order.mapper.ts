import Mapper from "@lib/ddd/mapper.interface.js";
import Order from "./domain/entity.js";
import { OrderDbRecord, OrderItem } from "./domain/type.js";

export interface OrderItemResponseDto {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderResponseDto {
  id: string;
  orderNumber: number;
  customerId: string;
  items: OrderItemResponseDto[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  discountCode?: string;
  createdAt: number;
}

export default class OrderMapper implements Mapper<
  Order,
  OrderDbRecord,
  OrderResponseDto
> {
  toPersistenceFromDomain(entity: Order): OrderDbRecord {
    const props = entity.getProps();
    return {
      _id: props.id,
      orderNumber: props.orderNumber,
      customerId: props.customerId,
      items: props.items,
      subtotal: props.subtotal,
      discountAmount: props.discountAmount,
      totalAmount: props.totalAmount,
      discountCode: props.discountCode,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }

  toDomainFromPersistence(record: OrderDbRecord): Order {
    return new Order({
      id: record._id,
      orderNumber: record.orderNumber,
      customerId: record.customerId,
      items: record.items,
      subtotal: record.subtotal,
      discountAmount: record.discountAmount,
      totalAmount: record.totalAmount,
      discountCode: record.discountCode,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toResponseFromDomain(entity: Order): OrderResponseDto {
    const props = entity.getProps();
    return {
      id: props.id,
      orderNumber: props.orderNumber,
      customerId: props.customerId,
      items: props.items,
      subtotal: props.subtotal,
      discountAmount: props.discountAmount,
      totalAmount: props.totalAmount,
      discountCode: props.discountCode,
      createdAt: props.createdAt,
    };
  }
}
