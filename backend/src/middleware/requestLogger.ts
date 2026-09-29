import { NextFunction, Request, Response } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("test method", req.method);
  console.log("test url", req.url);
  next();
};
