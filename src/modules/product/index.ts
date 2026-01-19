import MongoDB from "@lib/db/mongo.js";
import ProductMapper from "./product.mapper.js";
import ProductRepository from "./db/repository.js";
import ProductService from "./services/product.service.js";
import ProductHttpController from "./product.http.controller.js";
import getProductRouter from "./product.http.router.js";

type RequestTransformer = (controller: any) => any;

export default class ProductModule {
  private readonly repository: ProductRepository;
  private readonly service: ProductService;
  public readonly httpController: ProductHttpController;

  constructor(private readonly mongoDB: MongoDB) {
    const mapper = new ProductMapper();
    this.repository = ProductRepository.init(this.mongoDB, mapper);
    this.service = new ProductService(this.repository);
    this.httpController = new ProductHttpController(this.service, mapper);
  }

  getRouter(args: { requestTransformer: RequestTransformer }) {
    return getProductRouter({
      productHttpController: this.httpController,
      requestTransformer: args.requestTransformer,
    });
  }
}
