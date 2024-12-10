import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema({
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },

    subjectCount: {
        type: Number,
        required: true,
        default: 0, // Default number of subjects is 0
    },
    assignedInternships: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship', // Reference to the Internship model
        default: [], // Ensure it's an array by default
    }],
    // Link to User 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to User model
        // default: null,
    },

}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Export the Teacher model
export default mongoose.model("Teacher", TeacherSchema);
