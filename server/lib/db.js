import mongoose from "mongoose";
const mongoURI = "mongodb://localhost:27017/Uncheatable";

const connectMongodDB = async () => {
  try {
    await mongoose
      .connect(mongoURI)
      .then(() => console.log("Connected to MongoDB"))
      .catch((err) => {
        console.log(`Error :${err}`);
      });
  } catch (error) {}
};

export default connectMongodDB;
