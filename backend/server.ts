import "dotenv/config";
import app from "./app";
import {prisma} from "./config/prisma";

const PORT = Number(process.env.PORT) || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

// Gracefully disconnect prisma when server shuts down
let isShuttingDown = false;

function shutdown() {
  if(isShuttingDown) return;
  isShuttingDown = true;

  console.log("Shutting down the backend server...");

  server.close(async (error) => {
    try {
      await prisma.$disconnect();
      if(error) {
        console.error("Server shutdown failed:", error);
        process.exitCode = 1;
      } 
    } catch(disconnectError) {
      console.error("Prisma disconnect failed:", disconnectError);
      process.exitCode = 1;
    }
  })
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);