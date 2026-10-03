import express from "express";
import cors from "cors";
import { candidatesRouter } from "./routes/candidates.routes";
import { errorHandler } from "./middlewares/error-handler";
import { resumesRouter } from "./routes/resumes.routes";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/candidates", candidatesRouter);
app.use("/api/resumes", resumesRouter);

app.use(errorHandler);
