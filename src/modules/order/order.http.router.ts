import { Router, Request, Response } from "express";
import { Result } from "oxide.ts";
import OrderHttpController from "./order.http.controller.js";

type Controller = (req: Request, res: Response) => Promise<Result<any, Error>>;
type RequestTransformer = (controller: Controller) => any;

export default function getOrderRouter(args: {
  orderHttpController: OrderHttpController;
  requestTransformer: RequestTransformer;
}) {
  const { orderHttpController: controller, requestTransformer } = args;
  const getHandler = (fn: Controller) =>
    requestTransformer(fn.bind(controller));
  const router = Router();

  router.post("/:customerId/checkout", getHandler(controller.checkout));
  router.get("/:customerId", getHandler(controller.getOrdersByCustomer));
  router.get("/", getHandler(controller.getAllOrders));

  return router;
}
