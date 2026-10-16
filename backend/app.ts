import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import {prisma} from "./config/prisma";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        database: "connected",  
      }
    })
  } catch(error) {
    console.log(error);
    res.status(503).json({success: false, message: "Database is unavailable", code: "DATABASE_UNAVAILABLE"});
  }
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        code: "NOT_FOUND",
    });
});

// Centralised error handler
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    console.error("Unhandled application error:", error);

    if(res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        success: false,
        message: "Internal server error",
        code: "INTERNAL_ERROR",
    });
}

app.use(errorHandler);

export default app;