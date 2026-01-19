import { Result, Ok, Err } from "oxide.ts";
import Logger from "@lib/util/logger.js";
import {
  BadPayloadError,
  InvalidArgumentError,
  InvalidOperationError,
} from "@lib/util/errors.js";
import Order from "../domain/entity.js";
import { OrderItem } from "../domain/type.js";
import OrderRepositoryPort from "../db/repository.port.js";
import CartRepositoryPort from "@modules/cart/db/repository.port.js";
import AppConfigService from "@modules/app-config/services/app-config.service.js";
import DiscountCodeService from "@modules/discount-code/services/discount-code.service.js";

export interface CheckoutArgs {
  customerId: string;
  discountCode?: string;
}

export interface CheckoutResult {
  order: Order;
  generatedDiscountCode?: string;
}

export default class OrderService {
  private readonly logger = new Logger("OrderService");

  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    private readonly cartRepository: CartRepositoryPort,
    private readonly appConfigService: AppConfigService,
    private readonly discountCodeService: DiscountCodeService,
  ) {}

  async checkout(args: CheckoutArgs): Promise<Result<CheckoutResult, Error>> {
    this.logger.info("OrderService.checkout", args);

    if (!args.customerId) {
      return Err(new InvalidArgumentError("customerId is required"));
    }

    // Get cart
    const cartResult = await this.cartRepository.getByCustomerId({
      customerId: args.customerId,
    });
    if (cartResult.isErr()) {
      return cartResult;
    }

    const cart = cartResult.unwrap();
    if (cart.items.length === 0) {
      return Err(new InvalidOperationError("Cart is empty"));
    }

    // Get config for discountPercent
    const getConfigResult = await this.appConfigService.getOrCreateConfig();
    if (getConfigResult.isErr()) {
      return getConfigResult;
    }
    const config = getConfigResult.unwrap();

    // Increment order count and check if should generate discount
    const configResult = await this.appConfigService.incrementAndCheck();
    if (configResult.isErr()) {
      return configResult;
    }

    const { orderCount, shouldGenerate } = configResult.unwrap();

    // Generate discount code if nth order
    let generatedCode: string | undefined;
    if (shouldGenerate) {
      const codeResult = await this.discountCodeService.generateCode({
        orderNumber: orderCount,
        discountPercent: config.discountPercent,
      });
      if (codeResult.isOk()) {
        generatedCode = codeResult.unwrap().code;
        this.logger.info("Generated discount code", { code: generatedCode });
      }
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.priceSnapshot,
      0,
    );

    let discountAmount = 0;
    let appliedCode: string | undefined;

    // Validate and apply discount code if provided
    if (args.discountCode) {
      const discountResult = await this.discountCodeService.validateAndUse({
        code: args.discountCode,
      });
      if (discountResult.isErr()) {
        return discountResult;
      }

      const discount = discountResult.unwrap();
      discountAmount = Math.floor((subtotal * discount.discountPercent) / 100);
      appliedCode = discount.code;
      this.logger.info("Applied discount", {
        code: appliedCode,
        amount: discountAmount,
      });
    }

    const totalAmount = subtotal - discountAmount;

    // Create order
    const now = Date.now();
    const orderItems: OrderItem[] = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.priceSnapshot,
    }));

    const order = new Order({
      id: this.orderRepository.generateId(),
      orderNumber: orderCount,
      customerId: args.customerId,
      items: orderItems,
      subtotal,
      discountAmount,
      totalAmount,
      discountCode: appliedCode,
      createdAt: now,
      updatedAt: now,
    });

    const validation = order.validate();
    if (!validation.success) {
      return Err(new BadPayloadError(validation.error.message));
    }

    const orderResult = await this.orderRepository.create({ entity: order });
    if (orderResult.isErr()) {
      return orderResult;
    }

    // Clear cart after successful order
    await this.cartRepository.delete({ customerId: args.customerId });

    return Ok({
      order: orderResult.unwrap(),
      generatedDiscountCode: generatedCode,
    });
  }

  async getOrdersByCustomer(args: {
    customerId: string;
  }): Promise<Result<Order[], Error>> {
    this.logger.info("OrderService.getOrdersByCustomer", args);

    if (!args.customerId) {
      return Err(new InvalidArgumentError("customerId is required"));
    }

    return this.orderRepository.getByCustomerId({
      customerId: args.customerId,
    });
  }

  async getAllOrders(): Promise<Result<Order[], Error>> {
    this.logger.info("OrderService.getAllOrders");
    return this.orderRepository.getAll();
  }
}
