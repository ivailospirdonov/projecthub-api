import cors from "cors";
import express from "express";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import taskRouter from "./routes/task.routes";
import tagRouter from "./routes/tag.routes";
import auditRouter from "./routes/audit.routes";
import commentRouter from "./routes/comment.routes";
import projectRouter from "./routes/project.routes";
import organizationRouter from "./routes/organization.routes";
import { errorHandler } from "./middlewares/error.middleware";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/tags", tagRouter);
app.use("/api/v1/audit", auditRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/organizations", organizationRouter);

app.use(errorHandler);

export default app;
