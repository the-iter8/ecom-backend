import mongoose from "mongoose";

export default class MongoDB {
  public connection: any;
  public db: any;

  async connect(uri: string, dbName: string): Promise<void> {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 5000,
    });

    this.connection = mongoose.connection;
    this.db = this.connection.db;

    console.log(`✅ MongoDB connected to database: ${dbName}`);
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}
