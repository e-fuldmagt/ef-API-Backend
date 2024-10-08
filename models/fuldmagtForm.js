const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fuldmagtFormSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  icon: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  allowedUsers: {
    type: [{ type: mongoose.Schema.ObjectId, ref: "user" }],
    default: []
  },
  allowedCompanies: {
    type: [{ type: mongoose.Schema.ObjectId, ref: "company" }],
    default: []
  }
});
let FulmagtForm =  mongoose.model("fuldmagtForm", fuldmagtFormSchema, "fuldmagtForms");

module.exports = FulmagtForm;