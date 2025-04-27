import mongoose from "mongoose";
import Counter from "./count.js";

const productSchema = new mongoose.Schema({
  productId: { type: Number, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, required: true },
  quantity: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

// ✅ Pre-save Hook to Validate Category-Subcategory
productSchema.pre("save", async function (next) {
  if (!this.productId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "productId" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      this.productId = counter.value;
    } catch (err) {
      return next(err);
    }
  }

  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
