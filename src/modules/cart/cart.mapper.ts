import Mapper from "@lib/ddd/mapper.interface.js";
import Cart from "./domain/entity.js";
import { CartDbRecord, CartItem } from "./domain/type.js";

export interface CartItemResponseDto {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  productName?: string;
  productDescription?: string;
  productImage?: string;
  productCategory?: string;
}

export interface CartResponseDto {
  id: string;
  customerId: string;
  items: CartItemResponseDto[];
  totalAmount: number;
  createdAt: number;
  updatedAt: number;
}

export default class CartMapper implements Mapper<
  Cart,
  CartDbRecord,
  CartResponseDto
> {
  toPersistenceFromDomain(entity: Cart): CartDbRecord {
    const props = entity.getProps();
    return {
      _id: props.id,
      customerId: props.customerId,
      items: props.items,
      totalAmount: props.totalAmount,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }

  toDomainFromPersistence(record: CartDbRecord): Cart {
    return new Cart({
      id: record._id,
      customerId: record.customerId,
      items: record.items,
      totalAmount: record.totalAmount,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toResponseFromDomain(entity: Cart): CartResponseDto {
    return entity.getProps();
  }
}
