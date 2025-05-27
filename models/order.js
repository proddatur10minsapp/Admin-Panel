import mongoose from "mongoose";
import Counter from "./count.js";

// Order Schema
const orderSchema = new mongoose.Schema({
  orderId: {
    type: Number,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  deliveryLocation: {
    doorNumber: { type: Number, required: true },
    landmark: { type: String, required: true },
    address: { type: String, required: true },
    AddressMode: { type: String, enum: ["Work", "Home", "other"] },
  },
  items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      count: { type: Number, required: true },
    },
  ],
  status: {
    type: String,
    enum: ["available", "confirmed", "arriving", "delivered", "cancelled"],
    default: "available",
  },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to auto-increment orderId
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "orderId" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      this.orderId = counter.value;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
