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
    required: true,
  },
  firstnameBinome: {
    type: String,
    required: true,
  },
  start_deposit: {
    type: Date,
    required: true,
  },
  end_deposit: {
    type: Date,
    required: true,
  },
});

export default mongoose.model("Subject_PFA", Subject_PFASchema);
