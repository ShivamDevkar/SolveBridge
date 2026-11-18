import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import { prisma } from "./config/prisma";
import env from "./config/env";
import authRoute from "./routes/auth";
import categoriesRoute from "./routes/categories";
import notificationsRoute from "./routes/notifications";
import problemsRoute from "./routes/problems";
import proposalsRoute from "./routes/proposals";
import jobsRoute from "./routes/jobs";
import reviewsRoute from "./routes/reviews";
import adminRoute from "./routes/admin";
import { ApiError } from "./utils/apiError";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json());

app.get("/api/v1/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        database: "connected",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(503).json({
      success: false,
      message: "Database is unavailable",
      code: "DATABASE_UNAVAILABLE",
    });
  }
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/categories", categoriesRoute);
app.use("/api/v1/notifications", notificationsRoute);
app.use("/api/v1/problems", problemsRoute);
app.use("/api/v1/proposals", proposalsRoute);
app.use("/api/v1/jobs", jobsRoute);
app.use("/api/v1/reviews", reviewsRoute);
app.use("/api/v1/admin", adminRoute);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: "NOT_FOUND",
  });
});

// Centralised error handler
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      success: false,
      message: error.message,
      code: error.code,
      ...(error.details !== undefined ? { details: error.details } : {}),
    });
    return;
  }

  console.error("Unhandled application error:", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  });
};

app.use(errorHandler);

export default app;
