import mongoose from 'mongoose';

const DeliveryFeeSchema = new mongoose.Schema({
  DeliveryFee: {
    type: Number,
    required: true,
  },
  GiftWrapFee: {
    type: Number,
    required: true,
  },
});

const DeliveryFee = mongoose.model('delivery_fee', DeliveryFeeSchema);

export default DeliveryFee;
