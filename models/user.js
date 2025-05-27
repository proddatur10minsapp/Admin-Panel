import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: { type: String },
  phoneNumber: { type: String, required: true, unique: true },
  address: { type: mongoose.Schema.Types.Mixed }, // flexible object type
});

const User = mongoose.model("User", userSchema, "users");
export default User;

