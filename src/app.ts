import express from "express";
import cors from "cors";

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Тест route
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});
