const { type } = require("@hapi/joi/lib/extend");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  address: {
    address: { type: String, required: true },
    addressLine: { type: String, required: true },
    postalCode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    setPrimary: {
    type: Boolean, default: false}
  },
  image: {
    type: String,
  },
  phone: {
    countryCode: {
      type: String,
      required: false, // this ensures countryCode can be null
    },
    number: {
      type: Number,
      default: null, trim: true, unique: true, sparse: true
    }
  },
  email: {
    type: String,
    unique: true,
    default: null, 
    trim: true, 
    sparse: true
  },
  admin: {
    type: Boolean,
    default: false,
  },
  pin: {
    type: String,
  },
  loginAttempt: {
    type: Number,
    default: 0,
  },
  locked: {
    type: Boolean,
    default: false,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  signature:{
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Schema-level validation
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    this.invalidate('email', 'At least one field must be provided out of email and phone number');
  }
  next();
});
const User =  mongoose.model("user", userSchema, "users");
module.exports = User;
