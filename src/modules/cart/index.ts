import MongoDB from "#lib/db/mongo.js";
import CartMapper from "./cart.mapper.js";
import CartRepository from "./db/repository.js";
import CartService from "./services/cart.service.js";
import CartHttpController from "./cart.http.controller.js";
import getCartRouter from "./cart.http.router.js";
import ProductRepositoryPort from "#modules/product/db/repository.port.js";

type RequestTransformer = (controller: any) => any;

export default class CartModule {
  private readonly repository: CartRepository;
  private readonly service: CartService;
  public readonly httpController: CartHttpController;

  constructor(
    private readonly mongoDB: MongoDB,
    private readonly productRepository: ProductRepositoryPort,
  ) {
    const mapper = new CartMapper();
    this.repository = CartRepository.init(this.mongoDB, mapper);
    this.service = new CartService(this.repository, this.productRepository);
    this.httpController = new CartHttpController(
      this.service,
      mapper,
      this.productRepository,
    );
  }

  getRouter(args: { requestTransformer: RequestTransformer }) {
    return getCartRouter({
      cartHttpController: this.httpController,
      requestTransformer: args.requestTransformer,
    });
  }

  getRepository(): CartRepository {
    return this.repository;
  }
}
