import mongoose from "mongoose";

const trendCategorySchema = new mongoose.Schema({
  categoryId: {
    type: Number,
    required: true,
  },
  categoryName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  backgroundImage: {
    type: String,
    required: true,
  },
});

const TrendCategory = mongoose.models.TrendCategory || mongoose.model("TrendCategory", trendCategorySchema);
export default TrendCategory;
