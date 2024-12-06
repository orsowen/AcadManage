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
  sendStatus: {
    type: String,
    enum: ["First Sent", "Modified Sent", "Not Sent"],
    default: "Not Sent",
  }, // Indique l'état de l'envoi
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
 
  
});

const Subject_PFA = mongoose.model("Subject_PFA", Subject_PFASchema);

export default Subject_PFA;
