import express, { Express } from "express";
import cors from "cors";
import MongoDB from "@lib/db/mongo.js";
import config from "@conf/app.config.js";
import requestTransformer from "@lib/middleware/request-transformer.js";
import ProductModule from "@modules/product/index.js";
import CartModule from "@modules/cart/index.js";
import AppConfigModule from "@modules/app-config/index.js";
import DiscountCodeModule from "@modules/discount-code/index.js";
import OrderModule from "@modules/order/index.js";
import AdminModule from "@modules/admin/index.js";

async function bootstrap() {
  const app: Express = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize MongoDB
  const mongoDB = new MongoDB();
  await mongoDB.connect(config.mongodb.uri, config.mongodb.dbName);

  // Initialize modules
  const productModule = new ProductModule(mongoDB);
  const cartModule = new CartModule(mongoDB, productModule.getRepository());
  const appConfigModule = new AppConfigModule(mongoDB);
  const discountCodeModule = new DiscountCodeModule(mongoDB);
  const orderModule = new OrderModule(
    mongoDB,
    cartModule.getRepository(),
    appConfigModule.service,
    discountCodeModule.service,
  );
  const adminModule = new AdminModule(
    appConfigModule.service,
    discountCodeModule.service,
  );

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  app.use("/api/admin", adminModule.getRouter({ requestTransformer }));
  // Module routers
  app.use("/api/products", productModule.getRouter({ requestTransformer }));
  app.use("/api/cart", cartModule.getRouter({ requestTransformer }));
  app.use("/api/orders", orderModule.getRouter({ requestTransformer }));

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
