const { required } = require("joi");
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
  },
  additionalFields: {
    type: [String],
    required: true
  },
  additionalFieldsType: {
    type: [{
      type: String,
      enum: ["headline", "note", "textField", "textArea", "dateAndTime", "radioButton", "checkboxes"]
    }],
    required: true
  },
  additionalFieldsName: {
    type: [String],
    required: true
  },
  fuldmagtStatement: {
    type: String,
    required: true
  },
  fuldmagtCredentials: {
    type: String,
    required: true
  }
});
let FulmagtForm =  mongoose.model("fuldmagtForm", fuldmagtFormSchema, "fuldmagtForms");

module.exports = FulmagtForm;