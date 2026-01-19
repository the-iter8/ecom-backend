import ApiResponse from "#lib/api/api-response.js";
import Logger from "#lib/util/logger.js";
import { Request } from "express";
import { Ok, Result } from "oxide.ts";
import AdminService from "./services/admin.service.js";

type ApiResponseResult = Result<
  ReturnType<ApiResponse["ok" | "created" | "noContent"]>,
  Error
>;

export default class AdminHttpController {
  private readonly logger = new Logger("AdminHttpController");

  constructor(private readonly service: AdminService) {}

  async getConfig(req: Request): Promise<ApiResponseResult> {
    this.logger.info("AdminHttpController.getConfig");

    const result = await this.service.getConfig();
    if (result.isErr()) {
      this.logger.error("Error getting config", { error: result.unwrapErr() });
      return result;
    }

    return Ok(new ApiResponse().ok({ config: result.unwrap() }));
  }

  async generateDiscountCode(req: Request): Promise<ApiResponseResult> {
    this.logger.info("AdminHttpController.generateDiscountCode");

    const result = await this.service.generateDiscountCode();
    if (result.isErr()) {
      this.logger.error("Error generating discount code", {
        error: result.unwrapErr(),
      });
      return result;
    }

    return Ok(new ApiResponse().created({ discountCode: result.unwrap() }));
  }

  async getStats(req: Request): Promise<ApiResponseResult> {
    this.logger.info("AdminHttpController.getStats");

    const result = await this.service.getStats();
    if (result.isErr()) {
      this.logger.error("Error getting stats", {
        error: result.unwrapErr(),
      });
      return result;
    }

    return Ok(new ApiResponse().ok({ stats: result.unwrap() }));
  }
}
