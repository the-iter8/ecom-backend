import Mapper from "#lib/ddd/mapper.interface.js";
import Product from "./domain/entity.js";
import { ProductDbRecord, ProductProps } from "./domain/type.js";

export interface ProductResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export default class ProductMapper implements Mapper<
  Product,
  ProductDbRecord,
  ProductResponseDto
> {
  toPersistenceFromDomain(entity: Product): ProductDbRecord {
    const props = entity.getProps();
    return {
      _id: props.id,
      name: props.name,
      description: props.description,
      price: props.price,
      image: props.image,
      category: props.category,
      stock: props.stock,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }

  toDomainFromPersistence(record: ProductDbRecord): Product {
    return new Product({
      id: record._id,
      name: record.name,
      description: record.description,
      price: record.price,
      image: record.image,
      category: record.category,
      stock: record.stock,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toResponseFromDomain(entity: Product): ProductResponseDto {
    const props = entity.getProps();
    return {
      id: props.id,
      name: props.name,
      description: props.description,
      price: props.price,
      image: props.image,
      category: props.category,
      stock: props.stock,
    };
  }
}
