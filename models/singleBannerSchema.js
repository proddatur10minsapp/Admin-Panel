import mongoose from "mongoose";

const singleBannerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const SingleBanner =
  mongoose.models.SingleBanner ||
  mongoose.model("single_banner", singleBannerSchema);

export default SingleBanner;
