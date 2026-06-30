const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nearbyhub";

  try {
    await mongoose.connect(uri);

    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    console.log("✅ MongoDB connected:", mongoose.connection.host);

  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error(
      "Make sure MongoDB is running locally, or set MONGO_URI in .env to your Atlas connection string."
    );
    process.exit(1);
  }
};

module.exports = connectDB;