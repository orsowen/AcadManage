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
  anneYear: {
    type: String,
    default: function () {
      // Automatically calculate the current academic year
      const currentYear = new Date().getFullYear();
      const month = new Date().getMonth();
      // Academic year typically starts in September
      return month >= 8
        ? `${currentYear}-${currentYear + 1}`
        : `${currentYear - 1}-${currentYear}`;
    },
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
    }, // Required if binome is true
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
    enum: ["Pending", "Approved", "Rejected"], // Liste des statuts possibles
    default: "Pending", // Par défaut, le statut est "Pending"
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  published: {
    type: Boolean,
    default: false,
  }, // Indique si le sujet est publié
});

const Subject_PFA = mongoose.model("Subject_PFA", Subject_PFASchema);

export default Subject_PFA;
