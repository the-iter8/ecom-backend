import { Model } from "mongoose";
import { nanoid } from "nanoid";
import RepositoryPort from "./repository.port.js";

export default abstract class MongooseRepositoryBase<
  Entity,
  DbRecord,
> implements RepositoryPort {
  constructor(
    protected model: Model<DbRecord>,
    protected mapper: any,
  ) {}

  generateId(): string {
    return nanoid();
  }
}
