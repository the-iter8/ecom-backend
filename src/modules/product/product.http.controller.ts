import { Request } from "express";
import { Result, Ok } from "oxide.ts";
import Logger from "@lib/util/logger.js";
import { ApiResponse } from "@lib/api/index.js";
import ProductService from "./services/product.service.js";
import ProductMapper, { ProductResponseDto } from "./product.mapper.js";

type ApiResponseResult =
  | ReturnType<ApiResponse["ok"]>
  | ReturnType<ApiResponse["created"]>
  | ReturnType<ApiResponse["noContent"]>;

export default class ProductHttpController {
  private readonly logger = new Logger("ProductHttpController");

  constructor(
    private readonly service: ProductService,
    private readonly mapper: ProductMapper,
  ) {}

  async create(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("ProductHttpController.create", { body: req.body });

    const result = await this.service.create(req.body);
    if (result.isErr()) {
      this.logger.error("Error creating product", {
        error: result.unwrapErr(),
      });
      return result;
    }

    const dto = this.mapper.toResponseFromDomain(result.unwrap());
    return Ok(new ApiResponse().created({ product: dto }));
  }

  async getById(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("ProductHttpController.getById", { params: req.params });

    const result = await this.service.getById({ id: req.params.id });
    if (result.isErr()) {
      this.logger.error("Error getting product", { error: result.unwrapErr() });
      return result;
    }

    const dto = this.mapper.toResponseFromDomain(result.unwrap());
    return Ok(new ApiResponse().ok({ product: dto }));
  }

  async getAll(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("ProductHttpController.getAll", { query: req.query });

    const { category, minPrice, maxPrice, sortBy, page, limit } = req.query;

    const result = await this.service.getAll({
      category: category as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy as "price-low" | "price-high" | "featured",
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    if (result.isErr()) {
      this.logger.error("Error getting products", {
        error: result.unwrapErr(),
      });
      return result;
    }

    const paginatedResult = result.unwrap();
    const items = paginatedResult.items.map((product) =>
      this.mapper.toResponseFromDomain(product),
    );

    return Ok(
      new ApiResponse().ok({
        items,
        total: paginatedResult.total,
        page: paginatedResult.page,
        totalPages: paginatedResult.totalPages,
      }),
    );
  }

  async update(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("ProductHttpController.update", {
      params: req.params,
      body: req.body,
    });

    const result = await this.service.update({
      id: req.params.id,
      ...req.body,
    });
    if (result.isErr()) {
      this.logger.error("Error updating product", {
        error: result.unwrapErr(),
      });
      return result;
    }

    const dto = this.mapper.toResponseFromDomain(result.unwrap());
    return Ok(new ApiResponse().ok({ product: dto }));
  }

  async delete(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("ProductHttpController.delete", { params: req.params });

    const result = await this.service.delete({ id: req.params.id });
    if (result.isErr()) {
      this.logger.error("Error deleting product", {
        error: result.unwrapErr(),
      });
      return result;
    }

    return Ok(new ApiResponse().noContent());
  }
}
