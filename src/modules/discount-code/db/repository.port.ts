import { Result } from "oxide.ts";
import RepositoryPort from "#lib/ddd/repository.port.js";
import DiscountCode from "../domain/entity.js";

export default interface DiscountCodeRepositoryPort extends RepositoryPort {
  create(args: { entity: DiscountCode }): Promise<Result<DiscountCode, Error>>;
  getByCode(args: { code: string }): Promise<Result<DiscountCode, Error>>;
  update(args: { entity: DiscountCode }): Promise<Result<DiscountCode, Error>>;
  getAll(): Promise<Result<DiscountCode[], Error>>;
}
