import MongoDB from "@lib/db/mongo.js";
import OrderMapper from "./order.mapper.js";
import OrderRepository from "./db/repository.js";
import OrderService from "./services/order.service.js";
import OrderHttpController from "./order.http.controller.js";
import getOrderRouter from "./order.http.router.js";
import CartRepositoryPort from "@modules/cart/db/repository.port.js";
import AppConfigService from "@modules/app-config/services/app-config.service.js";
import DiscountCodeService from "@modules/discount-code/services/discount-code.service.js";

type RequestTransformer = (controller: any) => any;

export default class OrderModule {
  private readonly repository: OrderRepository;
  public readonly service: OrderService;
  public readonly httpController: OrderHttpController;

  constructor(
    private readonly mongoDB: MongoDB,
    private readonly cartRepository: CartRepositoryPort,
    private readonly appConfigService: AppConfigService,
    private readonly discountCodeService: DiscountCodeService,
  ) {
    const mapper = new OrderMapper();
    this.repository = OrderRepository.init(this.mongoDB, mapper);
    this.service = new OrderService(
      this.repository,
      this.cartRepository,
      this.appConfigService,
      this.discountCodeService,
    );
    this.httpController = new OrderHttpController(this.service, mapper);
  }

  getRouter(args: { requestTransformer: RequestTransformer }) {
    return getOrderRouter({
      orderHttpController: this.httpController,
      requestTransformer: args.requestTransformer,
    });
  }
}
