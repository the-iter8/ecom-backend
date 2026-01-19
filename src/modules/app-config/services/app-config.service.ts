import { Result, Ok, Err } from "oxide.ts";
import Logger from "@lib/util/logger.js";
import { BadPayloadError } from "@lib/util/errors.js";
import AppConfig from "../domain/entity.js";
import AppConfigRepositoryPort from "../db/repository.port.js";

export default class AppConfigService {
  private readonly logger = new Logger("AppConfigService");
  private readonly CONFIG_KEY = "system";

  constructor(private readonly repository: AppConfigRepositoryPort) {}

  async getOrCreateConfig(): Promise<Result<AppConfig, Error>> {
    this.logger.info("AppConfigService.getOrCreateConfig");

    const result = await this.repository.getByKey({ key: this.CONFIG_KEY });
    if (result.isOk()) {
      return result;
    }

    // Create default config: every 3rd order gets discount
    const now = Date.now();
    const config = new AppConfig({
      id: this.repository.generateId(),
      key: this.CONFIG_KEY,
      nthOrderValue: 3,
      totalOrderCount: 0,
      discountPercent: 10,
      createdAt: now,
      updatedAt: now,
    });

    const validation = config.validate();
    if (!validation.success) {
      return Err(new BadPayloadError(validation.error.message));
    }

    return this.repository.create({ entity: config });
  }

  async incrementAndCheck(): Promise<
    Result<{ orderCount: number; shouldGenerate: boolean }, Error>
  > {
    this.logger.info("AppConfigService.incrementAndCheck");

    const configResult = await this.getOrCreateConfig();
    if (configResult.isErr()) {
      return configResult;
    }

    const config = configResult.unwrap();
    const orderCount = config.incrementOrderCount();
    const shouldGenerate = config.shouldGenerateDiscount();

    const updateResult = await this.repository.update({ entity: config });
    if (updateResult.isErr()) {
      return updateResult;
    }

    return Ok({ orderCount, shouldGenerate });
  }

  async updateNthValue(args: {
    nthValue: number;
  }): Promise<Result<AppConfig, Error>> {
    this.logger.info("AppConfigService.updateNthValue", args);

    if (args.nthValue <= 0) {
      return Err(new BadPayloadError("nthValue must be positive"));
    }

    const configResult = await this.getOrCreateConfig();
    if (configResult.isErr()) {
      return configResult;
    }

    const config = configResult.unwrap();
    config.updateNthValue(args.nthValue);

    const validation = config.validate();
    if (!validation.success) {
      return Err(new BadPayloadError(validation.error.message));
    }

    return this.repository.update({ entity: config });
  }

  async getConfig(): Promise<Result<AppConfig, Error>> {
    return this.getOrCreateConfig();
  }
}
