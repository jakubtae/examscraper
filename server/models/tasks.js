import mongoose, { Schema } from "mongoose";

const tasksSchema = new Schema(
  {
    question: String,
    answer: String,
    imagePath: String,
  },
  {
    timestamps: true,
  }
);

const Tasks = mongoose.models.Tasks || mongoose.model("tasks2", tasksSchema);

export default Tasks;
