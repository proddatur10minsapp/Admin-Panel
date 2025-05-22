import mongoose from "mongoose";
import Counter from "./count.js";

const productSchema = new mongoose.Schema({
  productId: { type: Number, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true }, // primary image
  gallery: [{ type: String }], // ✅ array of secondary images
  price: { type: Number, required: true },
  discountPrice: { type: Number, required: true },
  quantity: { type: String, required: true },
  description: { type: String },
  keyFeatures: { type: String },
  specifications: { type: String },
  stock: { type: String, required: true },
  // ✅ These will be auto-added with defaults if not provided
  isPresentInCart: { type: Boolean, default: false },
  quantityInCart: { type: Number, default: 0 },
  isPresentInWishList: { type: Boolean, default: false },
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
