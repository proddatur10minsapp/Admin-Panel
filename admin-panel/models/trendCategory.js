import mongoose from "mongoose";

const trendCategorySchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  backgroundImage: {
    type: String,
    required: true,
  },
  priority: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    required: true,
    unique: true,
  },
});

// Automatically set categoryName based on referenced Category
trendCategorySchema.pre("save", async function (next) {
  if (this.isModified("category")) {
    try {
      const Category = mongoose.model("Category");
      const categoryDoc = await Category.findById(this.category);
      if (!categoryDoc) {
        return next(new Error("Invalid category reference."));
      }
      this.categoryName = categoryDoc.name;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const TrendCategory =
  mongoose.models.TrendCategory || mongoose.model("trend_category", trendCategorySchema);

export default TrendCategory;
