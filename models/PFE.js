import mongoose from 'mongoose';

const { Schema } = mongoose;

const PFESchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    Nom_societe: {
        type: String,
        required: true,
        trim: true,
    }, description: {
        type: String,
        required: true,
    },
    documents: {
        type: [String], // Array of document links or paths
        required: true,
    },
    StartDate: {
        type: Date,
        required: true,
    },
    EndDate: {
        type: Date,
        required: true,
    },
    isValid: {
        type: Boolean,
        default: false, // Default value
    },
    techList: {
        type: [String], // Array of technologies or tools
        required: true,
    },

    student: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Student model
        ref: 'Student', // Model name to reference
        // required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Teacher model
        ref: 'Teacher', // Model name to reference
        // required: true,
    },

}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create and export the Internship model
const PFE = mongoose.model('PFE', PFESchema);

export default PFE;
