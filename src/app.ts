import express from "express";
import cors from "cors";
import { loginHandler, signupHandler } from "./auth/auth.controller";

export const app = express();

app.use(cors());
app.use(express.json());

app.post("/auth/signup", signupHandler);
app.post("/auth/login", loginHandler);

export default app;
