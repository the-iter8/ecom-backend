import { Model } from "mongoose";
import { Result, Ok, Err } from "oxide.ts";
import MongooseRepositoryBase from "@lib/ddd/repository.base.js";
import { ResourceNotFoundError } from "@lib/util/errors.js";
import MongoDB from "@lib/db/mongo.js";
import Product from "../domain/entity.js";
import { ProductDbRecord } from "../domain/type.js";
import ProductMapper from "../product.mapper.js";
import ProductRepositoryPort, {
  GetAllProductsArgs,
  PaginatedResult,
} from "./repository.port.js";
import productSchema from "./schema.js";

export default class ProductRepository
  extends MongooseRepositoryBase<Product, ProductDbRecord>
  implements ProductRepositoryPort
{
  private static instance: ProductRepository | null = null;

  private constructor(model: Model<ProductDbRecord>, mapper: ProductMapper) {
    super(model, mapper);
  }

  static init(mongoDB: MongoDB, mapper: ProductMapper): ProductRepository {
    if (ProductRepository.instance) {
      throw new Error("ProductRepository already initialized");
    }
    const model = mongoDB.connection.model(
      "Product",
      productSchema,
      "products",
    ) as Model<ProductDbRecord>;
    ProductRepository.instance = new ProductRepository(model, mapper);
    return ProductRepository.instance;
  }

  static getInstance(): ProductRepository {
    if (!ProductRepository.instance) {
      throw new Error("ProductRepository not initialized");
    }
    return ProductRepository.instance;
  }

  async create(args: { entity: Product }): Promise<Result<Product, Error>> {
    try {
      const record = this.mapper.toPersistenceFromDomain(args.entity);
      const created = await this.model.create(record);
      const entity = this.mapper.toDomainFromPersistence(created.toObject());
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getById(args: { id: string }): Promise<Result<Product, Error>> {
    try {
      const record = await this.model.findById(args.id).lean();
      if (!record) {
        return Err(
          new ResourceNotFoundError(`Product with id ${args.id} not found`),
        );
      }
      const entity = this.mapper.toDomainFromPersistence(record);
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getAll(
    args: GetAllProductsArgs,
  ): Promise<Result<PaginatedResult, Error>> {
    try {
      const {
        category,
        minPrice,
        maxPrice,
        sortBy = "featured",
        page = 1,
        limit = 12,
      } = args;

      // Build filter
      const filter: any = {};
      if (category) filter.category = category;
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
      }

      // Build sort
      let sort: any = {};
      if (sortBy === "price-low") sort.price = 1;
      else if (sortBy === "price-high") sort.price = -1;
      else sort.createdAt = -1; // Featured = newest first

      const skip = (page - 1) * limit;

      const [records, total] = await Promise.all([
        this.model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        this.model.countDocuments(filter),
      ]);

      const items = records.map((record) =>
        this.mapper.toDomainFromPersistence(record),
      );

      return Ok({
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      return Err(error as Error);
    }
  }

  async update(args: { entity: Product }): Promise<Result<Product, Error>> {
    try {
      const record = this.mapper.toPersistenceFromDomain(args.entity);
      const updated = await this.model
        .findByIdAndUpdate(args.entity.id, record, { new: true })
        .lean();
      if (!updated) {
        return Err(
          new ResourceNotFoundError(
            `Product with id ${args.entity.id} not found`,
          ),
        );
      }
      const entity = this.mapper.toDomainFromPersistence(updated);
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async delete(args: { id: string }): Promise<Result<void, Error>> {
    try {
      const result = await this.model.findByIdAndDelete(args.id);
      if (!result) {
        return Err(
          new ResourceNotFoundError(`Product with id ${args.id} not found`),
        );
      }
      return Ok(undefined);
    } catch (error) {
      return Err(error as Error);
    }
  }
}
