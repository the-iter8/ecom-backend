import MongoDB from "@lib/db/mongo.js";
import DiscountCodeMapper from "./discount-code.mapper.js";
import DiscountCodeRepository from "./db/repository.js";
import DiscountCodeService from "./services/discount-code.service.js";

export default class DiscountCodeModule {
  private readonly repository: DiscountCodeRepository;
  public readonly service: DiscountCodeService;

  constructor(private readonly mongoDB: MongoDB) {
    const mapper = new DiscountCodeMapper();
    this.repository = DiscountCodeRepository.init(this.mongoDB, mapper);
    this.service = new DiscountCodeService(this.repository);
  }

  getRepository(): DiscountCodeRepository {
    return this.repository;
  }
}
