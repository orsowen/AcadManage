
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the Internship Schema
const InternshipSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    Type: {
        type: String,
        enum: ["PFA", "PFE", "STAGE"],
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
    topic: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Topic model
        ref: 'Topic', // Model name to reference
        required: true,
    },

    // uncomment ba3d ma ykml si sknader 5edmtou

    // Student: {
    //     type: mongoose.Schema.Types.ObjectId, // Reference to Student model
    //     ref: 'Student', // Model name to reference
    //     required: true,
    // },
    // teacher: {
    //     type: mongoose.Schema.Types.ObjectId, // Reference to Teacher model
    //     ref: 'Teachers', // Model name to reference
    //     // required: true,
    // },

}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create and export the Internship model
const Internship = mongoose.model('Internship', InternshipSchema);

export default Internship;
