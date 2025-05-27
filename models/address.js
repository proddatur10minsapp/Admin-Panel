import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  _id: { type: String }, 
  type: { type: String },          
  areaOrStreet: { type: String },  
  landmark: { type: String },    
  isDefault: { type: Boolean, default: false },
  phoneNumber: { type: String, required: true },
  _class: { type: String },       
}, {
  _id: false, 
});

const Address = mongoose.model("Address", addressSchema, "address");
export default Address;

