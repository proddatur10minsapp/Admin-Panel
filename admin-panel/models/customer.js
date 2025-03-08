import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {type : String},
  phone: { type: Number, required: true, unique: true },
  role: { type: String, enum: ["Customer"], default: "Customer" },
  liveLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  address: { type: String },
});

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;