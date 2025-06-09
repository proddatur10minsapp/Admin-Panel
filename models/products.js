import mongoose from "mongoose";
import Counter from "./count.js";
import Category from "./category.js"; // Import Category model

const productSchema = new mongoose.Schema({
  // your fields
  productId: { type: Number, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  gallery: [{ type: String }],
  price: { type: Number, required: true },
  discountPrice: { type: Number, required: true },
  quantity: { type: String, required: true },
  description: { type: String },
  keyFeatures: { type: String },
  specifications: { type: String },
  stock: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  groupName: { type: String }, // <- add groupName field
});

// Pre-save hook to auto set productId and groupName
productSchema.pre("save", async function (next) {
  try {
    if (!this.productId) {
      const counter = await Counter.findOneAndUpdate(
        { name: "productId" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      this.productId = counter.value;
    }

    // Only fetch and set groupName if category changed or groupName missing
    if (this.isModified("category") || !this.groupName) {
      const category = await Category.findById(this.category);
      if (!category) {
        return next(new Error("Invalid category ID"));
      }
      this.groupName = category.groupName;
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
