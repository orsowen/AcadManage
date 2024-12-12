import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the Topic Schema
const TopicSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    techList: {
        type: [String], // Array of technologies or tools
        required: true,
    },
});

const DocsSchema = new Schema({
    attestation: {
        type: String,
        required: true,
        trim: true,
        match: /\.(pdf|docx)$/i, // Accept only .pdf or .docx files
    },
    rapport: {
        type: String,
        required: true,
        trim: true,
        match: /\.(pdf|docx)$/i, // Accept only .pdf or .docx files
    },
    ficheEval: {
        type: String,
        required: true,
        trim: true,
        match: /\.(pdf|docx)$/i, // Accept only .pdf or .docx files
    },
});

// Define the Internship Schema
const InternshipSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    typeInternship: {
        type: String,
        enum: ["1", "2"],
        required: true,
    },
    documents: {
        type: DocsSchema, // Embedding the DocsSchema
        required: true, // Make this field mandatory
    },
    nomSociete: {
        type: String,
    },
    anneYear: {
        type: String,
        default: function () {
            // Automatically calculate the current academic year
            const currentYear = new Date().getFullYear();
            const month = new Date().getMonth();
            // Academic year typically starts in September
            return month >= 8
                ? `${currentYear}-${currentYear + 1}`
                : `${currentYear - 1}-${currentYear}`;
        },
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
    reasonIfNotValid: {
        type: String,
    },
    isArchived: {
        type: Boolean,
        default: false, // Default value
    },
    topic: {
        type: TopicSchema, // Embedding the TopicSchema
        required: true, // Make this field mandatory
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
const Internship = mongoose.model('Internship', InternshipSchema);

export default Internship;