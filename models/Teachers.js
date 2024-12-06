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
    cin: {
        type: Number,
        required: true,
        unique: true, // CIN should be unique
        validate: {
            validator: Number.isInteger, // Ensure CIN is an integer
            message: 'CIN must be an integer value.',
        },
    },
    email: {
        type: String,
        required: true,
        unique: true, // Email should be unique
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Validate email format
    },
    phone: {
        type: String,
        required: false,
        match: /^\+?[0-9]{7,15}$/, // Optional: Validate phone number
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

}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Export the Teacher model
export default mongoose.model("Teacher", TeacherSchema);
