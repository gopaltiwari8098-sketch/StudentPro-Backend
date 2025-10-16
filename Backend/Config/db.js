import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qmxpxy3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 sec timeout
      }
    );
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:");
    console.error("Reason:", error.message);
    process.exit(1);
  }
};

export default connectDB;
