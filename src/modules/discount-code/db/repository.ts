import { Model } from "mongoose";
import { Result, Ok, Err } from "oxide.ts";
import MongooseRepositoryBase from "#lib/ddd/repository.base.js";
import { ResourceNotFoundError } from "#lib/util/errors.js";
import MongoDB from "#lib/db/mongo.js";
import DiscountCode from "../domain/entity.js";
import { DiscountCodeDbRecord } from "../domain/type.js";
import DiscountCodeMapper from "../discount-code.mapper.js";
import DiscountCodeRepositoryPort from "./repository.port.js";
import discountCodeSchema from "./schema.js";

export default class DiscountCodeRepository
  extends MongooseRepositoryBase<DiscountCode, DiscountCodeDbRecord>
  implements DiscountCodeRepositoryPort
{
  private static instance: DiscountCodeRepository | null = null;

  private constructor(
    model: Model<DiscountCodeDbRecord>,
    mapper: DiscountCodeMapper,
  ) {
    super(model, mapper);
  }

  static init(
    mongoDB: MongoDB,
    mapper: DiscountCodeMapper,
  ): DiscountCodeRepository {
    if (DiscountCodeRepository.instance) {
      throw new Error("DiscountCodeRepository already initialized");
    }
    const model = mongoDB.connection.model(
      "DiscountCode",
      discountCodeSchema,
      "discountCodes",
    ) as Model<DiscountCodeDbRecord>;
    DiscountCodeRepository.instance = new DiscountCodeRepository(model, mapper);
    return DiscountCodeRepository.instance;
  }

  static getInstance(): DiscountCodeRepository {
    if (!DiscountCodeRepository.instance) {
      throw new Error("DiscountCodeRepository not initialized");
    }
    return DiscountCodeRepository.instance;
  }

  async create(args: {
    entity: DiscountCode;
  }): Promise<Result<DiscountCode, Error>> {
    try {
      const record = this.mapper.toPersistenceFromDomain(args.entity);
      const created = await this.model.create(record);
      const entity = this.mapper.toDomainFromPersistence(created.toObject());
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getByCode(args: {
    code: string;
  }): Promise<Result<DiscountCode, Error>> {
    try {
      const record = await this.model.findOne({ code: args.code }).lean();
      if (!record) {
        return Err(
          new ResourceNotFoundError(`Discount code ${args.code} not found`),
        );
      }
      const entity = this.mapper.toDomainFromPersistence(record);
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async update(args: {
    entity: DiscountCode;
  }): Promise<Result<DiscountCode, Error>> {
    try {
      const record = this.mapper.toPersistenceFromDomain(args.entity);
      const updated = await this.model
        .findByIdAndUpdate(args.entity.id, record, { new: true })
        .lean();
      if (!updated) {
        return Err(
          new ResourceNotFoundError(
            `Discount code with id ${args.entity.id} not found`,
          ),
        );
      }
      const entity = this.mapper.toDomainFromPersistence(updated);
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getAll(): Promise<Result<DiscountCode[], Error>> {
    try {
      const records = await this.model.find().lean();
      const entities = records.map((record) =>
        this.mapper.toDomainFromPersistence(record),
      );
      return Ok(entities);
    } catch (error) {
      return Err(error as Error);
    }
  }
}
