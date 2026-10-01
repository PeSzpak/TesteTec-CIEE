import express from "express";
import cors from "cors";
import { candidatesRouter } from "./routes/candidates.routes";
import { errorHandler } from "./middlewares/error-handler";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/candidates", candidatesRouter);

app.use(errorHandler);
