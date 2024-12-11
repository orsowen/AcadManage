import mongoose from 'mongoose';

const { Schema } = mongoose;

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
const PFESchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        Nom_societe: { type: String, required: true, trim: true },
        documents: { type: DocsSchema, required: true },
        topic: { type: TopicSchema, required: true },
        StartDate: { type: Date, required: true },
        EndDate: { type: Date, required: true },
        isValid: { type: Boolean, default: false },
        isAssigned: { type: Boolean, default: false },
        Publisher: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false },
        emailStatus: { type: String, enum: ["none", "first", "second"], default: "none" },
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
        Defense: { type: mongoose.Schema.Types.ObjectId, ref: 'DefensePFE' },

    },
    { timestamps: true }
);

const PFE = mongoose.model('PFE', PFESchema, 'PFES'); // Explicit collection name
export default PFE;
