import mongoose from "mongoose";
import Counter from "./count.js";

const categorySchema = new mongoose.Schema({
  categoryId: { type: Number, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
});

// Auto-increment categoryId
categorySchema.pre("save", async function (next) {
  if (!this.categoryId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "categoryId" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      this.categoryId = counter.value;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
// Export the model
export default Category;
