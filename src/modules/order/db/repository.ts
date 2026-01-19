import { Model } from "mongoose";
import { Result, Ok, Err } from "oxide.ts";
import MongooseRepositoryBase from "#lib/ddd/repository.base.js";
import { ResourceNotFoundError } from "#lib/util/errors.js";
import MongoDB from "#lib/db/mongo.js";
import Order from "../domain/entity.js";
import { OrderDbRecord } from "../domain/type.js";
import OrderMapper from "../order.mapper.js";
import OrderRepositoryPort from "./repository.port.js";
import orderSchema from "./schema.js";

export default class OrderRepository
  extends MongooseRepositoryBase<Order, OrderDbRecord>
  implements OrderRepositoryPort
{
  private static instance: OrderRepository | null = null;

  private constructor(model: Model<OrderDbRecord>, mapper: OrderMapper) {
    super(model, mapper);
  }

  static init(mongoDB: MongoDB, mapper: OrderMapper): OrderRepository {
    if (OrderRepository.instance) {
      throw new Error("OrderRepository already initialized");
    }
    const model = mongoDB.connection.model(
      "Order",
      orderSchema,
      "orders",
    ) as Model<OrderDbRecord>;
    OrderRepository.instance = new OrderRepository(model, mapper);
    return OrderRepository.instance;
  }

  static getInstance(): OrderRepository {
    if (!OrderRepository.instance) {
      throw new Error("OrderRepository not initialized");
    }
    return OrderRepository.instance;
  }

  async create(args: { entity: Order }): Promise<Result<Order, Error>> {
    try {
      const record = this.mapper.toPersistenceFromDomain(args.entity);
      const created = await this.model.create(record);
      const entity = this.mapper.toDomainFromPersistence(created.toObject());
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getById(args: { id: string }): Promise<Result<Order, Error>> {
    try {
      const record = await this.model.findById(args.id).lean();
      if (!record) {
        return Err(
          new ResourceNotFoundError(`Order with id ${args.id} not found`),
        );
      }
      const entity = this.mapper.toDomainFromPersistence(record);
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getByCustomerId(args: {
    customerId: string;
  }): Promise<Result<Order[], Error>> {
    try {
      const records = await this.model
        .find({ customerId: args.customerId })
        .sort({ createdAt: -1 })
        .lean();
      const entities = records.map((record) =>
        this.mapper.toDomainFromPersistence(record),
      );
      return Ok(entities);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getAll(): Promise<Result<Order[], Error>> {
    try {
      const records = await this.model.find().sort({ createdAt: -1 }).lean();
      const entities = records.map((record) =>
        this.mapper.toDomainFromPersistence(record),
      );
      return Ok(entities);
    } catch (error) {
      return Err(error as Error);
    }
  }
}
