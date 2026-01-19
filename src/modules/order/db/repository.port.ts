import { Result } from "oxide.ts";
import RepositoryPort from "#lib/ddd/repository.port.js";
import Order from "../domain/entity.js";

export default interface OrderRepositoryPort extends RepositoryPort {
  create(args: { entity: Order }): Promise<Result<Order, Error>>;
  getById(args: { id: string }): Promise<Result<Order, Error>>;
  getByCustomerId(args: {
    customerId: string;
  }): Promise<Result<Order[], Error>>;
  getAll(): Promise<Result<Order[], Error>>;
}
