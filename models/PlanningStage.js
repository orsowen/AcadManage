import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the PlanningStage Schema
const PlanningStageSchema = new Schema({
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
    internship: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Internship model
        ref: 'Internship', // Model name to reference
        required: true,
    },
    isArchived: {
        type: Boolean,
        default: false, // Default value
    },
    isPublished: {
        type: Boolean,
        default: true, // Default value
    },
    sendStatus: {
        type: String,
        enum: ["First Sent", "Modified Sent", "Not Sent"],
        default: "Not Sent",
    },
}, {
    timestamps: true,
});

// Create and export the PlanningStage model
const PlanningStage = mongoose.model('PlanningStage', PlanningStageSchema);

export default PlanningStage;