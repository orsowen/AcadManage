import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    associatedSubjects: [ 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject", 
        },
    ],
    archived: { 
        type: Boolean,
        default: false,
    },
});

export default mongoose.model("Skill", SkillSchema);
