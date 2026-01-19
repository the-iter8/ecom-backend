import { Request, Response, NextFunction } from "express";
import { Result } from "oxide.ts";
import { ApiResponse } from "#lib/api/index.js";

type Controller = (req: Request, res: Response) => Promise<Result<any, Error>>;

export default function requestTransformer(controller: Controller) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await controller(req, res);

      if (result.isErr()) {
        const error = result.unwrapErr();
        const statusCode = (error as any).statusCode || 500;
        return res
          .status(statusCode)
          .json(new ApiResponse().error(error, statusCode));
      }

      const response = result.unwrap();
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  };
}
