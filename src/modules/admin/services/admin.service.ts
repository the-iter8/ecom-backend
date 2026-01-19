import { Result, Ok, Err } from "oxide.ts";
import Logger from "@lib/util/logger.js";
import { InvalidOperationError } from "@lib/util/errors.js";
import AppConfigService from "../../app-config/services/app-config.service.js";
import DiscountCodeService from "../../discount-code/services/discount-code.service.js";
import OrderService from "../../order/services/order.service.js";

export default class AdminService {
  private readonly logger = new Logger("AdminService");

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly discountCodeService: DiscountCodeService,
    private readonly orderService: OrderService,
  ) {}

  async getConfig(): Promise<
    Result<
      {
        nthOrderValue: number;
        totalOrderCount: number;
        discountPercent: number;
        canGenerateDiscount: boolean;
      },
      Error
    >
  > {
    this.logger.info("AdminService.getConfig");

    const configResult = await this.appConfigService.getOrCreateConfig();
    if (configResult.isErr()) {
      return configResult;
    }

    const config = configResult.unwrap();
    const canGenerateDiscount = config.canGenerateDiscountNow();

    return Ok({
      nthOrderValue: config.nthOrderValue,
      totalOrderCount: config.totalOrderCount,
      discountPercent: config.discountPercent,
      canGenerateDiscount,
    });
  }

  async generateDiscountCode(): Promise<
    Result<{ code: string; discountPercent: number }, Error>
  > {
    this.logger.info("AdminService.generateDiscountCode");

    const configResult = await this.appConfigService.getOrCreateConfig();
    if (configResult.isErr()) {
      return configResult;
    }

    const config = configResult.unwrap();

    if (!config.canGenerateDiscountNow()) {
      const nextNthOrder =
        Math.ceil((config.totalOrderCount + 1) / config.nthOrderValue) *
        config.nthOrderValue;
      return Err(
        new InvalidOperationError(
          `Cannot generate discount code. Current order count: ${config.totalOrderCount}, nth value: ${config.nthOrderValue}. Next discount at order ${nextNthOrder}`,
        ),
      );
    }

    const nextOrderNumber = config.totalOrderCount + 1;
    const codeResult = await this.discountCodeService.generateCode({
      orderNumber: nextOrderNumber,
      discountPercent: config.discountPercent,
    });

    if (codeResult.isErr()) {
      return codeResult;
    }

    return Ok({
      code: codeResult.unwrap().code,
      discountPercent: config.discountPercent,
    });
  }

  async getStats(): Promise<
    Result<
      {
        totalOrders: number;
        totalItemsPurchased: number;
        totalPurchaseAmount: number;
        discountCodes: Array<{
          code: string;
          isUsed: boolean;
          generatedAtOrderNumber: number;
          discountPercent: number;
        }>;
        totalDiscountAmount: number;
      },
      Error
    >
  > {
    this.logger.info("AdminService.getStats");

    // Get all orders
    const ordersResult = await this.orderService.getAllOrders();
    if (ordersResult.isErr()) {
      return ordersResult;
    }

    const orders = ordersResult.unwrap();
    const totalOrders = orders.length;

    // Calculate total items purchased
    const totalItemsPurchased = orders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );

    // Calculate total purchase amount
    const totalPurchaseAmount = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    // Calculate total discount amount
    const totalDiscountAmount = orders.reduce(
      (sum, order) => sum + order.discountAmount,
      0,
    );

    // Get all discount codes
    const codesResult = await this.discountCodeService.getAll();
    if (codesResult.isErr()) {
      return codesResult;
    }

    const discountCodes = codesResult.unwrap().map((code) => ({
      code: code.code,
      isUsed: code.isUsed,
      generatedAtOrderNumber: code.generatedAtOrderNumber,
      discountPercent: code.discountPercent,
    }));

    return Ok({
      totalOrders,
      totalItemsPurchased,
      totalPurchaseAmount,
      discountCodes,
      totalDiscountAmount,
    });
  }
}
