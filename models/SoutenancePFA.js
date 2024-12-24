import mongoose from "mongoose";

const SoutenancePFASchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject_PFA",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // Format "HH:mm"
    required: true,
  },
  endTime: {
    type: String, // Format "HH:mm"
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher", // Enseignant encadrant
    required: true,
  },
  rapporteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher", // Enseignant rapporteur
    required: true,
  },
  status: {
    type: String,
    enum: ["publier", "masquer"],
    default: "masquer",
  },
});

export default mongoose.model("SoutenancePFA", SoutenancePFASchema);
