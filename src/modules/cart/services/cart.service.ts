import { Result, Ok, Err } from "oxide.ts";
import Logger from "#lib/util/logger.js";
import {
  BadPayloadError,
  InvalidArgumentError,
  ResourceNotFoundError,
  InvalidOperationError,
} from "#lib/util/errors.js";
import Cart from "../domain/entity.js";
import CartRepositoryPort from "../db/repository.port.js";
import ProductRepositoryPort from "#modules/product/db/repository.port.js";

export interface AddItemToCartArgs {
  customerId: string;
  productId: string;
  quantity: number;
}

export interface UpdateCartItemArgs {
  customerId: string;
  productId: string;
  quantity: number;
}

export default class CartService {
  private readonly logger = new Logger("CartService");

  constructor(
    private readonly cartRepository: CartRepositoryPort,
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async addItem(args: AddItemToCartArgs): Promise<Result<Cart, Error>> {
    this.logger.info("CartService.addItem", args);

    if (!args.customerId || !args.productId || !args.quantity) {
      return Err(
        new InvalidArgumentError(
          "customerId, productId, and quantity are required",
        ),
      );
    }

    if (args.quantity <= 0) {
      return Err(new BadPayloadError("Quantity must be positive"));
    }

    // Verify product exists and has sufficient stock
    const productResult = await this.productRepository.getById({
      id: args.productId,
    });
    if (productResult.isErr()) {
      return Err(productResult.unwrapErr());
    }

    const product = productResult.unwrap();
    if (product.stock < args.quantity) {
      return Err(new InvalidOperationError("Insufficient stock"));
    }

    // Get or create cart
    const cartResult = await this.cartRepository.getByCustomerId({
      customerId: args.customerId,
    });

    let cart: Cart;
    if (cartResult.isErr()) {
      // Create new cart
      const now = Date.now();
      cart = new Cart({
        id: this.cartRepository.generateId(),
        customerId: args.customerId,
        items: [],
        totalAmount: 0,
        createdAt: now,
        updatedAt: now,
      });

      cart.addItem(args.productId, args.quantity, product.price);

      const validation = cart.validate();
      if (!validation.success) {
        return Err(new BadPayloadError(validation.error.message));
      }

      return this.cartRepository.create({ entity: cart });
    } else {
      cart = cartResult.unwrap();
      cart.addItem(args.productId, args.quantity, product.price);

      const validation = cart.validate();
      if (!validation.success) {
        return Err(new BadPayloadError(validation.error.message));
      }

      return this.cartRepository.update({ entity: cart });
    }
  }

  async getCart(args: { customerId: string }): Promise<Result<Cart, Error>> {
    this.logger.info("CartService.getCart", args);

    if (!args.customerId) {
      return Err(new InvalidArgumentError("customerId is required"));
    }

    return this.cartRepository.getByCustomerId({
      customerId: args.customerId,
    });
  }

  async updateItemQuantity(
    args: UpdateCartItemArgs,
  ): Promise<Result<Cart, Error>> {
    this.logger.info("CartService.updateItemQuantity", args);

    if (!args.customerId || !args.productId) {
      return Err(
        new InvalidArgumentError("customerId and productId are required"),
      );
    }

    if (args.quantity <= 0) {
      return Err(new BadPayloadError("Quantity must be positive"));
    }

    const cartResult = await this.cartRepository.getByCustomerId({
      customerId: args.customerId,
    });
    if (cartResult.isErr()) {
      return cartResult;
    }

    const cart = cartResult.unwrap();
    cart.updateItemQuantity(args.productId, args.quantity);

    const validation = cart.validate();
    if (!validation.success) {
      return Err(new BadPayloadError(validation.error.message));
    }

    return this.cartRepository.update({ entity: cart });
  }

  async removeItem(args: {
    customerId: string;
    productId: string;
  }): Promise<Result<Cart, Error>> {
    this.logger.info("CartService.removeItem", args);

    if (!args.customerId || !args.productId) {
      return Err(
        new InvalidArgumentError("customerId and productId are required"),
      );
    }

    const cartResult = await this.cartRepository.getByCustomerId({
      customerId: args.customerId,
    });
    if (cartResult.isErr()) {
      return cartResult;
    }

    const cart = cartResult.unwrap();
    cart.removeItem(args.productId);

    const validation = cart.validate();
    if (!validation.success) {
      return Err(new BadPayloadError(validation.error.message));
    }

    return this.cartRepository.update({ entity: cart });
  }

  async clearCart(args: { customerId: string }): Promise<Result<void, Error>> {
    this.logger.info("CartService.clearCart", args);

    if (!args.customerId) {
      return Err(new InvalidArgumentError("customerId is required"));
    }

    return this.cartRepository.delete({ customerId: args.customerId });
  }
}
