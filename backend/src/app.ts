import cors from "cors";
import express from "express";
import { Request, Response } from "express";
import helmet from "helmet";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { authRouter } from "./routes/auth";
import { beleskeRouter } from "./routes/beleske";
import { firmeRouter } from "./routes/firme";
import { pacijentiRouter } from "./routes/pacijenti";
import { porudzbineRouter } from "./routes/porudzbine";
import { uslugeRouter } from "./routes/usluge";
import { vezeRouter } from "./routes/veze";

// FRONTEND_ORIGIN dolazi iz .env — u dev-u je Vite dev server, u produkciji pravi domen frontenda
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

// izdvojeno iz index.ts da bi testovi (supertest) mogli da uvezu app bez pokretanja pravog HTTP servera
export const app = express();

app.use(requestLogger);
// postavlja standardne bezbednosne HTTP header-e (npr. X-Content-Type-Options, HSTS)
app.use(helmet());
// dozvoljava browseru sa frontendOrigin-a da poziva ovaj API (bez ovoga browser blokira cross-origin fetch/XHR)
app.use(cors({ origin: frontendOrigin }));
// parsira JSON telo requesta (Content-Type: application/json) i puni req.body
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRouter);
app.use("/beleske", beleskeRouter);
app.use("/firme", firmeRouter);
app.use("/pacijenti", pacijentiRouter);
app.use("/porudzbine", porudzbineRouter);
app.use("/usluge", uslugeRouter);
app.use("/veze", vezeRouter);

// redosled je bitan: 404 hvata sve nepoznate rute, errorHandler mora biti poslednji middleware u lancu
app.use(notFoundHandler);
app.use(errorHandler);
