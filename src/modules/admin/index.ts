import requestTransformer from "@lib/middleware/request-transformer.js";
import AdminService from "./services/admin.service.js";

type RequestTransformer = typeof requestTransformer;
import AdminHttpController from "./admin.http.controller.js";
import getAdminRouter from "./admin.http.router.js";
import AppConfigService from "../app-config/services/app-config.service.js";
import DiscountCodeService from "../discount-code/services/discount-code.service.js";

export default class AdminModule {
  private readonly service: AdminService;
  public readonly httpController: AdminHttpController;

  constructor(
    appConfigService: AppConfigService,
    discountCodeService: DiscountCodeService,
  ) {
    this.service = new AdminService(appConfigService, discountCodeService);
    this.httpController = new AdminHttpController(this.service);
  }

  getRouter(args: { requestTransformer: RequestTransformer }) {
    return getAdminRouter({
      adminHttpController: this.httpController,
      ...args,
    });
  }
}
