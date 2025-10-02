import mongoose from "mongoose";

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected ✅")
    );
    mongoose.connection.on("error", (err) =>
      console.log(`❌ Database connection error: ${err.message}`)
    );
    mongoose.connection.on("disconnected", () =>
      console.log("⚠️ Database disconnected")
    );

    await mongoose.connect(DB, {
      dbName: "lms",
    });
  } catch (error) {
    console.error("❌ Could not connect to database:", error);
    process.exit(1);
  }
};

export default connectDB;
