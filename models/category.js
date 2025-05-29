import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  groupName: { type: String, required: true },
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
// Export the model
export default Category;
