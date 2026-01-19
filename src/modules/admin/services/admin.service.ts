import { Result, Ok, Err } from "oxide.ts";
import Logger from "@lib/util/logger.js";
import { InvalidOperationError } from "@lib/util/errors.js";
import AppConfigService from "../../app-config/services/app-config.service.js";
import DiscountCodeService from "../../discount-code/services/discount-code.service.js";

export default class AdminService {
  private readonly logger = new Logger("AdminService");

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly discountCodeService: DiscountCodeService,
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
    const canGenerateDiscount = config.shouldGenerateDiscount();

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

    if (!config.shouldGenerateDiscount()) {
      return Err(
        new InvalidOperationError(
          `Cannot generate discount code. Current order count: ${config.totalOrderCount}, nth value: ${config.nthOrderValue}. Next discount at order ${Math.ceil(config.totalOrderCount / config.nthOrderValue) * config.nthOrderValue}`,
        ),
      );
    }

    const codeResult = await this.discountCodeService.generateCode({
      orderNumber: config.totalOrderCount,
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
}
