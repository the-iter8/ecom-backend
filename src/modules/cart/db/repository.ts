import { Model } from "mongoose";
import { Result, Ok, Err } from "oxide.ts";
import MongooseRepositoryBase from "#lib/ddd/repository.base.js";
import { ResourceNotFoundError } from "#lib/util/errors.js";
import MongoDB from "#lib/db/mongo.js";
import Cart from "../domain/entity.js";
import { CartDbRecord } from "../domain/type.js";
import CartMapper from "../cart.mapper.js";
import CartRepositoryPort from "./repository.port.js";
import cartSchema from "./schema.js";

export default class CartRepository
  extends MongooseRepositoryBase<Cart, CartDbRecord>
  implements CartRepositoryPort
{
  private static instance: CartRepository | null = null;

  private constructor(model: Model<CartDbRecord>, mapper: CartMapper) {
    super(model, mapper);
  }

  static init(mongoDB: MongoDB, mapper: CartMapper): CartRepository {
    if (CartRepository.instance) {
      throw new Error("CartRepository already initialized");
    }
    const model = mongoDB.connection.model(
      "Cart",
      cartSchema,
      "carts",
    ) as Model<CartDbRecord>;
    CartRepository.instance = new CartRepository(model, mapper);
    return CartRepository.instance;
  }

  static getInstance(): CartRepository {
    if (!CartRepository.instance) {
      throw new Error("CartRepository not initialized");
    }
    return CartRepository.instance;
  }

  async create(args: { entity: Cart }): Promise<Result<Cart, Error>> {
    try {
      const record = this.mapper.toPersistenceFromDomain(args.entity);
      const created = await this.model.create(record);
      const entity = this.mapper.toDomainFromPersistence(created.toObject());
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getByCustomerId(args: {
    customerId: string;
  }): Promise<Result<Cart, Error>> {
    try {
      const record = await this.model
        .findOne({ customerId: args.customerId })
        .lean();
      if (!record) {
        return Err(
          new ResourceNotFoundError(
            `Cart for customer ${args.customerId} not found`,
          ),
        );
      }
      const entity = this.mapper.toDomainFromPersistence(record);
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async update(args: { entity: Cart }): Promise<Result<Cart, Error>> {
    try {
      const record = this.mapper.toPersistenceFromDomain(args.entity);
      const updated = await this.model
        .findOneAndUpdate({ customerId: args.entity.customerId }, record, {
          new: true,
        })
        .lean();
      if (!updated) {
        return Err(
          new ResourceNotFoundError(
            `Cart for customer ${args.entity.customerId} not found`,
          ),
        );
      }
      const entity = this.mapper.toDomainFromPersistence(updated);
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async delete(args: { customerId: string }): Promise<Result<void, Error>> {
    try {
      const result = await this.model.findOneAndDelete({
        customerId: args.customerId,
      });
      if (!result) {
        return Err(
          new ResourceNotFoundError(
            `Cart for customer ${args.customerId} not found`,
          ),
        );
      }
      return Ok(undefined);
    } catch (error) {
      return Err(error as Error);
    }
  }
}
