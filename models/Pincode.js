import mongoose from "mongoose";

const PincodeGroupSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincodes: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return arr.every(code => /^\d{6}$/.test(code));
      },
      message: props => `One or more pincodes are invalid in ${props.value}`,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const Pincode =
  mongoose.models.Pincode || mongoose.model("pincodes", PincodeGroupSchema);

export default Pincode;
