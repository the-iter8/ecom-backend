import { Result, Ok, Err } from "oxide.ts";
import Logger from "#lib/util/logger.js";
import { BadPayloadError, InvalidOperationError } from "#lib/util/errors.js";
import DiscountCode from "../domain/entity.js";
import DiscountCodeRepositoryPort from "../db/repository.port.js";

export default class DiscountCodeService {
  private readonly logger = new Logger("DiscountCodeService");

  constructor(private readonly repository: DiscountCodeRepositoryPort) {}

  async generateCode(args: {
    orderNumber: number;
    discountPercent: number;
  }): Promise<Result<DiscountCode, Error>> {
    this.logger.info("DiscountCodeService.generateCode", args);

    const code = `DISCOUNT${String(args.orderNumber).padStart(3, "0")}`;
    const now = Date.now();

    const discountCode = new DiscountCode({
      id: this.repository.generateId(),
      code,
      isUsed: false,
      generatedAtOrderNumber: args.orderNumber,
      discountPercent: args.discountPercent,
      createdAt: now,
      updatedAt: now,
    });

    const validation = discountCode.validate();
    if (!validation.success) {
      return Err(new BadPayloadError(validation.error.message));
    }

    return this.repository.create({ entity: discountCode });
  }

  async validateAndUse(args: {
    code: string;
  }): Promise<Result<DiscountCode, Error>> {
    this.logger.info("DiscountCodeService.validateAndUse", args);

    const codeResult = await this.repository.getByCode({ code: args.code });
    if (codeResult.isErr()) {
      return codeResult;
    }

    const discountCode = codeResult.unwrap();
    if (!discountCode.canBeUsed()) {
      return Err(new InvalidOperationError("Discount code already used"));
    }

    discountCode.markAsUsed();
    return this.repository.update({ entity: discountCode });
  }

  async getAll(): Promise<Result<DiscountCode[], Error>> {
    this.logger.info("DiscountCodeService.getAll");
    return this.repository.getAll();
  }
}
