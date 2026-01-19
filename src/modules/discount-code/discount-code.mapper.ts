import Mapper from "#lib/ddd/mapper.interface.js";
import DiscountCode from "./domain/entity.js";
import { DiscountCodeDbRecord } from "./domain/type.js";

export interface DiscountCodeResponseDto {
  code: string;
  isUsed: boolean;
  generatedAtOrderNumber: number;
  discountPercent: number;
}

export default class DiscountCodeMapper implements Mapper<
  DiscountCode,
  DiscountCodeDbRecord,
  DiscountCodeResponseDto
> {
  toPersistenceFromDomain(entity: DiscountCode): DiscountCodeDbRecord {
    const props = entity.getProps();
    return {
      _id: props.id,
      code: props.code,
      isUsed: props.isUsed,
      generatedAtOrderNumber: props.generatedAtOrderNumber,
      discountPercent: props.discountPercent,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }

  toDomainFromPersistence(record: DiscountCodeDbRecord): DiscountCode {
    return new DiscountCode({
      id: record._id,
      code: record.code,
      isUsed: record.isUsed,
      generatedAtOrderNumber: record.generatedAtOrderNumber,
      discountPercent: record.discountPercent,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toResponseFromDomain(entity: DiscountCode): DiscountCodeResponseDto {
    return {
      code: entity.code,
      isUsed: entity.isUsed,
      generatedAtOrderNumber: entity.generatedAtOrderNumber,
      discountPercent: entity.discountPercent,
    };
  }
}
