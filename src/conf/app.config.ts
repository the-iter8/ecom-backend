import "dotenv/config";

const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || "",
    dbName: process.env.MONGODB_DB_NAME || "ecommerce",
  },
  server: {
    port: parseInt(process.env.PORT || "3000"),
  },
  app: {
    constantCustomerId: process.env.CONSTANT_CUSTOMER_ID || "CUSTOMER_001",
  },
};

export default config;
