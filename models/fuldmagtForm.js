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
  fuldmagt_image: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  selectedUsers: {
    type: [{ type: mongoose.Schema.ObjectId, ref: "user" }],
    default: []
  },
  selectedCompanies: {
    type: [{ type: mongoose.Schema.ObjectId, ref: "company" }],
    default: []
  },
  exceptUsers: {
     type: Boolean,
     required: true,
     default: false
  },
  exceptCompanies: {
    type: Boolean,
    required: true,
    default: false
  },
  additionalFields: {
    type: [String],
    required: true
  },
  additionalFieldsType: {
    type: [{
      type: String,
      enum: ["headline", "note", "textField", "textArea", "date", "radioButtons", "checkBoxes"]
    }],
    required: true
  },
  isAgentSignRequired: {
    type: Boolean,
    required: true,
    default: false
  },
  additionalFieldsObject: {
    type: [Object],
    required: true
  },
  purchaseType: {
    type: String,
    required: true,
    default: "tier1",
    enum: ["tier1", "tier2", "tier3"]
  },
  fuldmagtStatement: {
    type: String,
    required: true
  }
});
let FuldmagtForm =  mongoose.model("fuldmagtForm", fuldmagtFormSchema, "fuldmagtForms");

module.exports = FuldmagtForm;