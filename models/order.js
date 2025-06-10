import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  productName: String,
  image: String,
  category: mongoose.Schema.Types.ObjectId,
  categoryName: String,
  quantity: Number,
  isProductAvailabe: Boolean,
  price: Number,
  totalCurrentPrice: Number,
  discountedPrice: Number,
  totalDiscountedAmount: Number,
  totalPrice: Number,
  updatedAt: Date,
  discountPercentage: Number,
}, { _id: false });

const DeliveryAddressSchema = new mongoose.Schema({
  _id: String,
  type: String,
  areaOrStreet: String,
  landmark: String,
  pincode: Number,
  isDefault: Boolean,
  phoneNumber: String
}, { _id: false });

const OrdersCartDTOSchema = new mongoose.Schema({
  _id: String,
  phoneNumber: String,
  updatedAt: Date,
  productsList: [ProductSchema],
  totalItemsInCart: Number,
  currentTotalPrice: Number,
  discountedAmount: Number,
  totalPrice: Number
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  _id: String,
  OrdersCartDTO: OrdersCartDTOSchema,
  deliveryCharges: Number,
  totalPayable: Number,
  deliveryAddress: DeliveryAddressSchema,
  phoneNumber: String,
  orderStatus: {
    type: String,
    enum: ['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'EXPIRED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    enum: ['CASH_ON_DELIVERY', 'ONLINE', 'UPI'],
    default: 'CASH_ON_DELIVERY'
  },
  createdAt: Date,
  updatedAt: Date
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
