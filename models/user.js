const { required } = require("@hapi/joi/lib/base");
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
  },
  image: {
    type: String,
  },
  phone: {
    code: {
      type: String,
    },
    number: {
      type: Number,
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  password: {
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("user", userSchema, "users");
