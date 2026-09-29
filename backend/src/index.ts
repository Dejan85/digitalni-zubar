import express from "express";
import { NextFunction, Request, Response } from "express";

import "dotenv/config";
import { requestLogger } from "./middleware/requestLogger";

const app = express();
const port = process.env.PORT;

app.use(requestLogger);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log("Server started on port", port);
});
