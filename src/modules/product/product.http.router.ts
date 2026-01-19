import { Router, Request, Response } from "express";
import { Result } from "oxide.ts";
import ProductHttpController from "./product.http.controller.js";

type Controller = (req: Request, res: Response) => Promise<Result<any, Error>>;
type RequestTransformer = (controller: Controller) => any;

export default function getProductRouter(args: {
  productHttpController: ProductHttpController;
  requestTransformer: RequestTransformer;
}) {
  const { productHttpController: controller, requestTransformer } = args;
  const getHandler = (fn: Controller) =>
    requestTransformer(fn.bind(controller));
  const router = Router();

  router.get("/", getHandler(controller.getAll));
  router.get("/:id", getHandler(controller.getById));
  router.post("/", getHandler(controller.create));
  router.put("/:id", getHandler(controller.update));
  router.delete("/:id", getHandler(controller.delete));

  return router;
}
