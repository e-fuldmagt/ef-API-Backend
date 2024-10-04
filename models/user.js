const { type } = require("@hapi/joi/lib/extend");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    firstName: { type: String, required: true },
    lastName: { type: String, default: ""},
  },
  address: {
    address: { type: String, required: true },
    addressLine: { type: String, required: true },
    postalCode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    setPrimary: {type: Boolean, default: false}
  },
  image: {
    type: String,
  },
  phone: {
    countryCode: {
      type: String,
      trim: true,
      required: true, // this ensures countryCode can be null
    },
    number: {
      type: Number,
      unique: true,
      trim: true,
      required: true,
    }
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  dateOfBirth: {
    type: Date
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
  deviceId: {
    type: String,
  },
  refreshTokens: {
    type: [String],
    default: [],
    required: true
  },
  notificationIds: {
    type: [String],
    default: [],
    required: true
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "company",
    default: null
  }
});

const User =  mongoose.model("user", userSchema, "users");
module.exports = User;
