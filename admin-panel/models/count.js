import mongoose from "mongoose";

// Check if the model already exists before defining
const Counter = mongoose.models.Counter || mongoose.model("Counter", new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
}));

export default Counter;
