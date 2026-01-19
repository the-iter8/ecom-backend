import { Router } from "express";
import AdminHttpController from "./admin.http.controller.js";
import requestTransformer from "@lib/middleware/request-transformer.js";
import { Request, Response } from "express";
import { Result } from "oxide.ts";

type Controller = (req: Request, res: Response) => Promise<Result<any, Error>>;
type RequestTransformer = typeof requestTransformer;

export default function getAdminRouter(args: {
  adminHttpController: AdminHttpController;
  requestTransformer: RequestTransformer;
}) {
  const { adminHttpController: controller, requestTransformer } = args;
  const getHandler = (fn: Controller) =>
    requestTransformer(fn.bind(controller));
  const router = Router();

  router.get("/config", getHandler(controller.getConfig));
  router.post(
    "/discount-codes/generate",
    getHandler(controller.generateDiscountCode),
  );
  router.get("/stats", getHandler(controller.getStats));

  return router;
}
