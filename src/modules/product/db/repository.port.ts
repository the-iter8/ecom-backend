import { Result } from "oxide.ts";
import RepositoryPort from "#lib/ddd/repository.port.js";
import Product from "../domain/entity.js";

export interface GetAllProductsArgs {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price-low" | "price-high" | "featured";
  page?: number;
  limit?: number;
}

export interface PaginatedResult {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export default interface ProductRepositoryPort extends RepositoryPort {
  create(args: { entity: Product }): Promise<Result<Product, Error>>;
  getById(args: { id: string }): Promise<Result<Product, Error>>;
  getAll(args: GetAllProductsArgs): Promise<Result<PaginatedResult, Error>>;
  update(args: { entity: Product }): Promise<Result<Product, Error>>;
  delete(args: { id: string }): Promise<Result<void, Error>>;
}
