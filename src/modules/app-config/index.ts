import MongoDB from "#lib/db/mongo.js";
import AppConfigMapper from "./app-config.mapper.js";
import AppConfigRepository from "./db/repository.js";
import AppConfigService from "./services/app-config.service.js";

export default class AppConfigModule {
  private readonly repository: AppConfigRepository;
  public readonly service: AppConfigService;

  constructor(private readonly mongoDB: MongoDB) {
    const mapper = new AppConfigMapper();
    this.repository = AppConfigRepository.init(this.mongoDB, mapper);
    this.service = new AppConfigService(this.repository);
  }

  getRepository(): AppConfigRepository {
    return this.repository;
  }
}
