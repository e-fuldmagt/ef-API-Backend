const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const companySchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "user",
  },
  cvr: {
    type: Number,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        return value.toString().length === 8;
      },
      message: "CVR must be exactly 8 digits",
    },
  },
  name: {
    type: String,
    required: true,
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
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
  },
  signature:{
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
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

module.exports = mongoose.model("company", companySchema, "companies");
