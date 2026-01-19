import express, { Express } from "express";
import MongoDB from "@lib/db/mongo";
import config from "@conf/app.config";

async function bootstrap() {
  const app: Express = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize MongoDB
  const mongoDB = new MongoDB();
  await mongoDB.connect(config.mongodb.uri, config.mongodb.dbName);

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Module routers will be registered here

  // Start server
  const port = config.server.port;
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\nShutting down gracefully...");
    await mongoDB.disconnect();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
