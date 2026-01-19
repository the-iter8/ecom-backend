import { Request } from "express";
import { Result, Ok } from "oxide.ts";
import Logger from "@lib/util/logger.js";
import { ApiResponse } from "@lib/api/index.js";
import OrderService from "./services/order.service.js";
import OrderMapper from "./order.mapper.js";

type ApiResponseResult =
  | ReturnType<ApiResponse["ok"]>
  | ReturnType<ApiResponse["created"]>;

export default class OrderHttpController {
  private readonly logger = new Logger("OrderHttpController");

  constructor(
    private readonly service: OrderService,
    private readonly mapper: OrderMapper,
  ) {}

  async checkout(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("OrderHttpController.checkout", {
      params: req.params,
      body: req.body,
    });

    const result = await this.service.checkout({
      customerId: req.params.customerId,
      discountCode: req.body.discountCode,
    });

    if (result.isErr()) {
      this.logger.error("Error during checkout", { error: result.unwrapErr() });
      return result;
    }

    const { order, generatedDiscountCode } = result.unwrap();
    const dto = this.mapper.toResponseFromDomain(order);

    return Ok(
      new ApiResponse().created({
        order: dto,
        generatedDiscountCode,
      }),
    );
  }

  async getOrdersByCustomer(
    req: Request,
  ): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("OrderHttpController.getOrdersByCustomer", {
      params: req.params,
    });

    const result = await this.service.getOrdersByCustomer({
      customerId: req.params.customerId,
    });

    if (result.isErr()) {
      this.logger.error("Error getting orders", { error: result.unwrapErr() });
      return result;
    }

    const dtos = result
      .unwrap()
      .map((order) => this.mapper.toResponseFromDomain(order));
    return Ok(new ApiResponse().ok({ orders: dtos }));
  }

  async getAllOrders(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("OrderHttpController.getAllOrders");

    const result = await this.service.getAllOrders();

    if (result.isErr()) {
      this.logger.error("Error getting all orders", {
        error: result.unwrapErr(),
      });
      return result;
    }

    const dtos = result
      .unwrap()
      .map((order) => this.mapper.toResponseFromDomain(order));
    return Ok(new ApiResponse().ok({ orders: dtos }));
  }
}
