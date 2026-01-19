import { Result, Ok, Err } from "oxide.ts";
import Logger from "@lib/util/logger.js";
import { BadPayloadError, InvalidArgumentError } from "@lib/util/errors.js";
import Product from "../domain/entity.js";
import ProductRepositoryPort, {
  GetAllProductsArgs,
  PaginatedResult,
} from "../db/repository.port.js";

export interface CreateProductArgs {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export interface UpdateProductArgs {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  stock?: number;
}

export default class ProductService {
  private readonly logger = new Logger("ProductService");

  constructor(private readonly repository: ProductRepositoryPort) {}

  async create(args: CreateProductArgs): Promise<Result<Product, Error>> {
    this.logger.info("ProductService.create", args);

    const now = Date.now();
    const entity = new Product({
      id: this.repository.generateId(),
      name: args.name,
      description: args.description,
      price: args.price,
      image: args.image,
      category: args.category,
      stock: args.stock,
      createdAt: now,
      updatedAt: now,
    });

    const validation = entity.validate();
    if (!validation.success) {
      return Err(new BadPayloadError(validation.error.message));
    }

    return this.repository.create({ entity });
  }

  async getById(args: { id: string }): Promise<Result<Product, Error>> {
    this.logger.info("ProductService.getById", args);

    if (!args.id) {
      return Err(new InvalidArgumentError("Product ID is required"));
    }

    return this.repository.getById({ id: args.id });
  }

  async getAll(
    args: GetAllProductsArgs,
  ): Promise<Result<PaginatedResult, Error>> {
    this.logger.info("ProductService.getAll", args);
    return this.repository.getAll(args);
  }

  async update(args: UpdateProductArgs): Promise<Result<Product, Error>> {
    this.logger.info("ProductService.update", args);

    const productResult = await this.repository.getById({ id: args.id });
    if (productResult.isErr()) {
      return productResult;
    }

    const product = productResult.unwrap();
    const props = product.getProps();

    const updatedEntity = new Product({
      ...props,
      name: args.name ?? props.name,
      description: args.description ?? props.description,
      price: args.price ?? props.price,
      image: args.image ?? props.image,
      category: args.category ?? props.category,
      stock: args.stock ?? props.stock,
      updatedAt: Date.now(),
    });

    const validation = updatedEntity.validate();
    if (!validation.success) {
      return Err(new BadPayloadError(validation.error.message));
    }

    return this.repository.update({ entity: updatedEntity });
  }

  async delete(args: { id: string }): Promise<Result<void, Error>> {
    this.logger.info("ProductService.delete", args);

    if (!args.id) {
      return Err(new InvalidArgumentError("Product ID is required"));
    }

    return this.repository.delete({ id: args.id });
  }
}
