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
  isArchived: { type: Boolean, default: false },
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
  FirstPublication: { type: Boolean, default: true },
});

export default mongoose.model("SoutenancePFA", SoutenancePFASchema);
