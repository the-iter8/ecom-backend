import { Result } from "oxide.ts";
import RepositoryPort from "@lib/ddd/repository.port.js";
import Cart from "../domain/entity.js";

export default interface CartRepositoryPort extends RepositoryPort {
  create(args: { entity: Cart }): Promise<Result<Cart, Error>>;
  getByCustomerId(args: { customerId: string }): Promise<Result<Cart, Error>>;
  update(args: { entity: Cart }): Promise<Result<Cart, Error>>;
  delete(args: { customerId: string }): Promise<Result<void, Error>>;
}
