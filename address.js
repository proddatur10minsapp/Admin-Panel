import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  houseNo: { type: String, required: true },
  streetName: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  addressType: {
    type: String,
    required: true,
    enum: ["work", "home", "school", "college"],
  },
});

export default addressSchema;
