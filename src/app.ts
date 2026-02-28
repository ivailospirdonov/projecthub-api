import cors from "cors";
import express from "express";
import { pinoHttp } from "pino-http";
import { v4 as uuidv4 } from "uuid";
import { errorHandler } from "./middlewares/error.middleware";
import auditRouter from "./routes/audit.routes";
import authRouter from "./routes/auth.routes";
import commentRouter from "./routes/comment.routes";
import organizationRouter from "./routes/organization.routes";
import projectRouter from "./routes/project.routes";
import tagRouter from "./routes/tag.routes";
import taskRouter from "./routes/task.routes";
import userRouter from "./routes/user.routes";
import healthRoutes from "./routes/health.routes";
import { logger } from "./utils/logger";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger, genReqId: () => uuidv4() }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/tags", tagRouter);
app.use("/api/v1/audit", auditRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/health", healthRoutes);

app.use(errorHandler);

export default app;
