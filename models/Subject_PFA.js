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
    ref: 'Student',

  },
    binome: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: function() { return this.binome; } // Required if binome is true
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
