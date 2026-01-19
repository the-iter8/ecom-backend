import { Model } from "mongoose";
import { Result, Ok, Err } from "oxide.ts";
import MongooseRepositoryBase from "@lib/ddd/repository.base.js";
import { ResourceNotFoundError } from "@lib/util/errors.js";
import MongoDB from "@lib/db/mongo.js";
import AppConfig from "../domain/entity.js";
import { AppConfigDbRecord } from "../domain/type.js";
import AppConfigMapper from "../app-config.mapper.js";
import AppConfigRepositoryPort from "./repository.port.js";
import appConfigSchema from "./schema.js";

export default class AppConfigRepository
  extends MongooseRepositoryBase<AppConfig, AppConfigDbRecord>
  implements AppConfigRepositoryPort
{
  private static instance: AppConfigRepository | null = null;

  private constructor(
    model: Model<AppConfigDbRecord>,
    mapper: AppConfigMapper,
  ) {
    super(model, mapper);
  }

  static init(mongoDB: MongoDB, mapper: AppConfigMapper): AppConfigRepository {
    if (AppConfigRepository.instance) {
      throw new Error("AppConfigRepository already initialized");
    }
    const model = mongoDB.connection.model(
      "AppConfig",
      appConfigSchema,
      "appConfig",
    ) as Model<AppConfigDbRecord>;
    AppConfigRepository.instance = new AppConfigRepository(model, mapper);
    return AppConfigRepository.instance;
  }

  static getInstance(): AppConfigRepository {
    if (!AppConfigRepository.instance) {
      throw new Error("AppConfigRepository not initialized");
    }
    return AppConfigRepository.instance;
  }

  async create(args: { entity: AppConfig }): Promise<Result<AppConfig, Error>> {
    try {
      const record = this.mapper.toPersistenceFromDomain(args.entity);
      const created = await this.model.create(record);
      const entity = this.mapper.toDomainFromPersistence(created.toObject());
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async getByKey(args: { key: string }): Promise<Result<AppConfig, Error>> {
    try {
      const record = await this.model.findOne({ key: args.key }).lean();
      if (!record) {
        return Err(
          new ResourceNotFoundError(`AppConfig with key ${args.key} not found`),
        );
      }
      const entity = this.mapper.toDomainFromPersistence(record);
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async update(args: { entity: AppConfig }): Promise<Result<AppConfig, Error>> {
    try {
      const record = this.mapper.toPersistenceFromDomain(args.entity);
      const updated = await this.model
        .findOneAndUpdate({ key: args.entity.key }, record, { new: true })
        .lean();
      if (!updated) {
        return Err(
          new ResourceNotFoundError(
            `AppConfig with key ${args.entity.key} not found`,
          ),
        );
      }
      const entity = this.mapper.toDomainFromPersistence(updated);
      return Ok(entity);
    } catch (error) {
      return Err(error as Error);
    }
  }
}
