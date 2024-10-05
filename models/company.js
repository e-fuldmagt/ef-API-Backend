const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const companySchema = new Schema({
  createdBy: {
    type: mongoose.Schema.ObjectId,
    required: true,
    unique: true,
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
  companyName: {
    type: String,
    required: true,
  },
  address: {
    address: { type: String, required: true },
    addressLine: { type: String, required: true },
    postalCode: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    setPrimary: {
      type: Boolean,
      default: false,
    },
  },
  image: {
    type: String,
    required: true,
    default: "https://firebasestorage.googleapis.com/v0/b/fuldmagt-8cb2d.appspot.com/o/default-company-image.png?alt=media&token=736193c4-0516-4e31-bc38-fc61af7197f0"
  },
  phone: {
    countryCode: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
      unique: true
    },
  },
  signature: {
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

const Company =  mongoose.model("company", companySchema, "companies");
module.exports = Company;
