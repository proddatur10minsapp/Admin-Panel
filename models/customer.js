import mongoose from "mongoose";
import addressSchema from "./address.js";  
import Counter from "./count.js";

const customerSchema = new mongoose.Schema({
  custId: { type: Number, unique: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  phone: { type: Number, required: true, unique: true },
  role: { type: String, enum: ["Customer"], default: "Customer" },
  addresses: {
    type: [addressSchema], 
    required: true,
  },  
  liveLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
});

// Auto-increment custId
customerSchema.pre("save", async function (next) {
  if (!this.custId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "custId" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      this.custId = counter.value;
    } catch (err) {
      return next(err);
    }
  }

  next();
});

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
