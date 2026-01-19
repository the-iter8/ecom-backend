import Mapper from "#lib/ddd/mapper.interface.js";
import AppConfig from "./domain/entity.js";
import { AppConfigDbRecord } from "./domain/type.js";

export interface AppConfigResponseDto {
  key: string;
  nthOrderValue: number;
  totalOrderCount: number;
}

export default class AppConfigMapper implements Mapper<
  AppConfig,
  AppConfigDbRecord,
  AppConfigResponseDto
> {
  toPersistenceFromDomain(entity: AppConfig): AppConfigDbRecord {
    const props = entity.getProps();
    return {
      _id: props.id,
      key: props.key,
      nthOrderValue: props.nthOrderValue,
      totalOrderCount: props.totalOrderCount,
      discountPercent: props.discountPercent,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }

  toDomainFromPersistence(record: AppConfigDbRecord): AppConfig {
    return new AppConfig({
      id: record._id,
      key: record.key,
      nthOrderValue: record.nthOrderValue,
      totalOrderCount: record.totalOrderCount,
      discountPercent: record.discountPercent,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toResponseFromDomain(entity: AppConfig): AppConfigResponseDto {
    return {
      key: entity.key,
      nthOrderValue: entity.nthOrderValue,
      totalOrderCount: entity.totalOrderCount,
    };
  }
}
