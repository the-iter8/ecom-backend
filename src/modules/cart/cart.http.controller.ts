import { Request } from "express";
import { Result, Ok } from "oxide.ts";
import Logger from "#lib/util/logger.js";
import { ApiResponse } from "#lib/api/index.js";
import CartService from "./services/cart.service.js";
import CartMapper, { CartItemResponseDto } from "./cart.mapper.js";
import ProductRepositoryPort from "#modules/product/db/repository.port.js";

type ApiResponseResult =
  | ReturnType<ApiResponse["ok"]>
  | ReturnType<ApiResponse["created"]>
  | ReturnType<ApiResponse["noContent"]>;

export default class CartHttpController {
  private readonly logger = new Logger("CartHttpController");

  constructor(
    private readonly service: CartService,
    private readonly mapper: CartMapper,
    private readonly productRepository: ProductRepositoryPort,
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

    const cart = result.unwrap();
    const dto = this.mapper.toResponseFromDomain(cart);

    // Enrich items with product details
    const enrichedItems: CartItemResponseDto[] = await Promise.all(
      dto.items.map(async (item) => {
        const productResult = await this.productRepository.getById({
          id: item.productId,
        });
        if (productResult.isOk()) {
          const product = productResult.unwrap();
          return {
            ...item,
            productName: product.name,
            productDescription: product.description,
            productImage: product.image,
            productCategory: product.category,
          };
        }
        return item;
      }),
    );

    return Ok(new ApiResponse().ok({ cart: { ...dto, items: enrichedItems } }));
  }

  async updateItemQuantity(
    req: Request,
  ): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("CartHttpController.updateItemQuantity", {
      params: req.params,
      body: req.body,
    });

    const result = await this.service.updateItemQuantity({
      customerId: req.params.customerId,
      productId: req.body.productId,
      quantity: req.body.quantity,
    });

    if (result.isErr()) {
      this.logger.error("Error updating item quantity", {
        error: result.unwrapErr(),
      });
      return result;
    }

    const dto = this.mapper.toResponseFromDomain(result.unwrap());
    return Ok(new ApiResponse().ok({ cart: dto }));
  }

  async incrementItem(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("CartHttpController.incrementItem", {
      params: req.params,
    });

    const result = await this.service.incrementItem({
      customerId: req.params.customerId,
      productId: req.params.productId,
    });

    if (result.isErr()) {
      this.logger.error("Error incrementing item", {
        error: result.unwrapErr(),
      });
      return result;
    }

    const dto = this.mapper.toResponseFromDomain(result.unwrap());
    return Ok(new ApiResponse().ok({ cart: dto }));
  }

  async decrementItem(req: Request): Promise<Result<ApiResponseResult, Error>> {
    this.logger.info("CartHttpController.decrementItem", {
      params: req.params,
    });

    const result = await this.service.decrementItem({
      customerId: req.params.customerId,
      productId: req.params.productId,
    });

    if (result.isErr()) {
      this.logger.error("Error decrementing item", {
        error: result.unwrapErr(),
      });
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
