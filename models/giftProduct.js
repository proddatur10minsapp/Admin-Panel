import mongoose from "mongoose";

const giftProductSchema = new mongoose.Schema({
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
  startAmount: { type: Number, required: true },
  endAmount: { type: Number, required: true },
});


const giftProduct = mongoose.models.GiftProduct || mongoose.model("GiftProduct", giftProductSchema, "gift_product");

export default giftProduct;
