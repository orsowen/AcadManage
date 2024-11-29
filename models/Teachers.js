import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema({
    lastName: { 
        type: String,
        required: true
    },
    firstName: { 
        type: String,
        required: true
    },
    cin: { 
        type: String,
        required: true
    },
});

export default mongoose.model("Teacher", TeacherSchema);
