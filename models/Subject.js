import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    chargeHoraire: {
        type: Number,
        required: true
    },
    coeff: {
        type: Number,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    credit: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    option: {
        type: String,
        required: true
    }
});

export default mongoose.model("Subject", SubjectSchema);