import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Subject_PFASchema = new Schema({
  binome: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  lastnameBinome: {
    type: String,
    required: false,
  },
  firstnameBinome: {
    type: String,
    required: false,
  },
  lastnameMonome: {
    type: String,
    required: false,
  },
  firstnameMonome: {
    type: String,
    required: false,
  },
});

const Subject_PFA = mongoose.model("Subject_PFA", Subject_PFASchema);

export default Subject_PFA;