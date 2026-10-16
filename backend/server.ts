import "dotenv/config";
import app from "./app";
import {prisma} from "./config/prisma";
import env from "./config/env";

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

// Gracefully disconnect prisma when server shuts down
let isShuttingDown = false;

function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("Shutting down the backend server...");

  const forceExit = setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);

  server.closeIdleConnections();

  server.close(async (error) => {
    try {
      if (error) {
        console.error("Server shutdown failed:", error);
        process.exitCode = 1;
      }

      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Prisma disconnect failed:", disconnectError);
      process.exitCode = 1;
    } finally {
      clearTimeout(forceExit);
    }
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);