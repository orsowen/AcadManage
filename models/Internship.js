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
        // required: true,
        trim: true,
        match: /\.(pdf|docx)$/i, // Accept only .pdf or .docx files
        default: null, // default
    },
    rapport: {
        type: String,
        // required: true,
        trim: true,
        match: /\.(pdf|docx)$/i, // Accept only .pdf or .docx files
        default: null, // default
    },
    ficheEval: {
        type: String,
        // required: true,
        trim: true,
        match: /\.(pdf|docx)$/i, // Accept only .pdf or .docx files
        default: null, // default
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
    depotStatus: {
        type: String,
        enum: ["in time", "late"],
    },
    isDeposed: {
        type: Boolean,
        default: false, // Default value
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
        default: null, // Default value
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
    planning: {
        type: mongoose.Schema.Types.ObjectId, // Reference to PlanningStage model
        ref: 'PlanningStage', // Model name to reference
        // required: false,
    },

}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Pre-save hook to check if all documents are present and update isDeposed field
InternshipSchema.pre('save', function (next) {
    // Check if all documents in DocsSchema exist
    // if (this.documents) {
    const { ficheEval, attestation, rapport } = this.documents;
    if (ficheEval && attestation && rapport) {
        this.isDeposed = true;  // Set isDeposed to true if all documents are present
        return next();
    }
    // }
    this.isDeposed = false; // Otherwise, set it to false
    next();
});
// Create and export the Internship model
const Internship = mongoose.model('Internship', InternshipSchema);

export default Internship;