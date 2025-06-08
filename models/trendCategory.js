import mongoose from "mongoose";

const trendCategorySchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  // ── COPIED FROM Category ───────────────────────────────
  categoryName: { type: String, required: true },
  groupName:    { type: String, required: true },   //  ← new
  // groupImage: { type: String, required: true },   //  ← add if you need it
  // ───────────────────────────────────────────────────────
  backgroundImage: { type: String, required: true },
  priority: {
    type: Number,
    enum:  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    unique: true,
    required: true,
  },
});

/* ───────────────  PRE-SAVE HOOK  ──────────────── */
trendCategorySchema.pre("save", async function (next) {
  // Only run when the referenced category changes or on a new doc
  if (!this.isModified("category")) return next();

  try {
    const Category = mongoose.model("Category");
    // Only fetch the fields we need
    const cat = await Category.findById(this.category).select("name groupName groupImage");
    if (!cat) return next(new Error("Invalid category reference."));

    // Copy the values
    this.categoryName = cat.name;
    this.groupName    = cat.groupName;
    // this.groupImage = cat.groupImage;   // uncomment if you added groupImage
    return next();
  } catch (err) {
    return next(err);
  }
});

const TrendCategory =
  mongoose.models.TrendCategory || mongoose.model("trend_category", trendCategorySchema);

export default TrendCategory;
