import mongoose from "mongoose";

const bannerSponsorshipSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    priority: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10,11,12,13,14,15,16,17,18,19,20], 
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Banner", "Sponsorship"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const BannerSponsorship =
  mongoose.models.BannerSponsorship ||
  mongoose.model("banner_sponsorship", bannerSponsorshipSchema);

export default BannerSponsorship;
