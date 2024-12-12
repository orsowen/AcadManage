import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Subject_PFASchema = new Schema({
  binomeExits: {
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
  monome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    default: null,
  },
  binome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    default: null,
    required: function () {
      return this.binome;
    }, 
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },
  technologies: {
    type: [String],
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"], 
    default: "Pending", 
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  published: {
    type: Boolean,
    default: false,
  }, 
});

const Subject_PFA = mongoose.model("Subject_PFA", Subject_PFASchema);

export default Subject_PFA;
