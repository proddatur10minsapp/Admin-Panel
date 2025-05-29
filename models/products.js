import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // primary image
  gallery: [{ type: String }], // ✅ array of secondary images
  price: { type: Number, required: true },
  discountPrice: { type: Number, required: true },
  quantity: { type: String, required: true },
  description: { type: String },
  keyFeatures: { type: String },
  specifications: { type: String },
  stock: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});


const Product = mongoose.model("Product", productSchema);
export default Product;
