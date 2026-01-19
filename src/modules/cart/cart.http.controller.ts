import { Request } from "express";
import { Result, Ok } from "oxide.ts";
import Logger from "@lib/util/logger.js";
import { ApiResponse } from "@lib/api/index.js";
import CartService from "./services/cart.service.js";
import CartMapper from "./cart.mapper.js";

type ApiResponseResult =
  | ReturnType<ApiResponse["ok"]>
  | ReturnType<ApiResponse["created"]>
  | ReturnType<ApiResponse["noContent"]>;

export default class CartHttpController {
  private readonly logger = new Logger("CartHttpController");

  constructor(
    private readonly service: CartService,
    private readonly mapper: CartMapper,
  ) {}

  async addItem(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("CartHttpController.addItem", {
      params: req.params,
      body: req.body,
    });

    const result = await this.service.addItem({
      customerId: req.params.customerId,
      productId: req.body.productId,
      quantity: req.body.quantity,
    });

    if (result.isErr()) {
      this.logger.error("Error adding item to cart", {
        error: result.unwrapErr(),
      });
      return result;
    }

    const dto = this.mapper.toResponseFromDomain(result.unwrap());
    return Ok(new ApiResponse().ok({ cart: dto }));
  }

  async getCart(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("CartHttpController.getCart", { params: req.params });

    const result = await this.service.getCart({
      customerId: req.params.customerId,
    });

    if (result.isErr()) {
      this.logger.error("Error getting cart", { error: result.unwrapErr() });
      return result;
    }

    const dto = this.mapper.toResponseFromDomain(result.unwrap());
    return Ok(new ApiResponse().ok({ cart: dto }));
  }

  async removeItem(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("CartHttpController.removeItem", { params: req.params });

    const result = await this.service.removeItem({
      customerId: req.params.customerId,
      productId: req.params.productId,
    });

    if (result.isErr()) {
      this.logger.error("Error removing item from cart", {
        error: result.unwrapErr(),
      });
      return result;
    }

    const dto = this.mapper.toResponseFromDomain(result.unwrap());
    return Ok(new ApiResponse().ok({ cart: dto }));
  }

  async clearCart(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("CartHttpController.clearCart", { params: req.params });

    const result = await this.service.clearCart({
      customerId: req.params.customerId,
    });

    if (result.isErr()) {
      this.logger.error("Error clearing cart", { error: result.unwrapErr() });
      return result;
    }

    return Ok(new ApiResponse().noContent());
  }
}
