import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the SoutenanceStage Schema
const SoutenanceStageSchema = new Schema({
    horaire: {
        type: Number, // Representing hours as a number (e.g., 14 for 2 PM)
        required: true,
    },
    day: {
        type: Date, // Store the day as a Date object (e.g., '2024-12-15')
        required: true,
    },
    meet_link: {
        type: String, // Link to the meeting (could be a URL or any format of meeting link)
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Student model
        ref: 'Student', // Model name to reference
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Teacher model
        ref: 'Teacher', // Model name to reference
        required: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create and export the SoutenanceStage model
const SoutenanceStage = mongoose.model('SoutenanceStage', SoutenanceStageSchema);

export default SoutenanceStage;
