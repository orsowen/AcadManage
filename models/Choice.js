
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ChoiceSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: "Subject_PFA",
    required: true,
  },
  priority: {
    type: Number,
    required:false,
    enum: [1, 2, 3], // Priorité 1, 2 ou 3
  },
  binome: {
    type: Schema.Types.ObjectId,
    ref: "Student", // Référence à l'étudiant binôme
    required: false,
  },
  teacherAcceptance: {
    type: Boolean,
    default: false,
    required: false,
  },
  valid: {
    type: Boolean,
    default: false,
    required: false,
  },
});

const Choice = mongoose.model("Choice", ChoiceSchema);

export default Choice;
