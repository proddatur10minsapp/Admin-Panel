import mongoose from "mongoose";

const trendCategorySchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  backgroundImage: {
    type: String,
    required: true,
  },
  priority: {
    type: Number,
    enum: [1,2,3,4,5,6,7,8,9,10],
    required: true,
    unique: true,
  },
});

const TrendCategory = mongoose.models.TrendCategory || mongoose.model("trend_category", trendCategorySchema);
export default TrendCategory;
