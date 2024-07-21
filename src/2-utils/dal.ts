import mongoose from "mongoose";
import { appConfig } from "./app-config";
import dotenv from "dotenv";
// Load ".env" file into process.env object:
dotenv.config();
// DAL = Data Access Layer - The only one accessing the database.
class DAL {
  public async connect(): Promise<void> {
    try {
      const db = await mongoose.connect(
        process.env.MONGODB_URI || appConfig.mongodbConnectionString,
        {
          serverSelectionTimeoutMS: 30000, // Increase to 30 seconds
          socketTimeoutMS: 45000, // Socket timeout
        }
      );
      console.log(
        `We're connected to MongoDB, database: ${db.connections[0].name}`
      );
    } catch (err: any) {
      console.log(err);
    }
  }
}

export const dal = new DAL();
