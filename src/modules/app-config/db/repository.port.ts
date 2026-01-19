import { Result } from "oxide.ts";
import RepositoryPort from "@lib/ddd/repository.port.js";
import AppConfig from "../domain/entity.js";

export default interface AppConfigRepositoryPort extends RepositoryPort {
  getByKey(args: { key: string }): Promise<Result<AppConfig, Error>>;
  update(args: { entity: AppConfig }): Promise<Result<AppConfig, Error>>;
  create(args: { entity: AppConfig }): Promise<Result<AppConfig, Error>>;
}
