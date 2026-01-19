import { Router, Request, Response } from "express";
import { Result } from "oxide.ts";
import CartHttpController from "./cart.http.controller.js";

type Controller = (req: Request, res: Response) => Promise<Result<any, Error>>;
type RequestTransformer = (controller: Controller) => any;

export default function getCartRouter(args: {
  cartHttpController: CartHttpController;
  requestTransformer: RequestTransformer;
}) {
  const { cartHttpController: controller, requestTransformer } = args;
  const getHandler = (fn: Controller) =>
    requestTransformer(fn.bind(controller));
  const router = Router();

  router.get("/:customerId", getHandler(controller.getCart));
  router.post("/:customerId/items", getHandler(controller.addItem));
  router.put("/:customerId/items", getHandler(controller.updateItemQuantity));
  router.post(
    "/:customerId/items/:productId/increment",
    getHandler(controller.incrementItem),
  );
  router.post(
    "/:customerId/items/:productId/decrement",
    getHandler(controller.decrementItem),
  );
  router.delete(
    "/:customerId/items/:productId",
    getHandler(controller.removeItem),
  );
  router.delete("/:customerId", getHandler(controller.clearCart));

  return router;
}
