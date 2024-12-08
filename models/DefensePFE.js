import mongoose from 'mongoose';

const { Schema } = mongoose;

const DefensePFESchema = new Schema({
    Salle: {
        type: String,
        required: true,
        trim: true, // Trim to remove unnecessary spaces
    },
    Date: {
        type: Date,
        required: true,
    },
    heure: {
        type: Number,
        required: true,
        min: 0, // Ensure time is non-negative
        max: 23, // Assume the hour field is in 24-hour format
    },
    PresidentJury: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher', // Model name for reference
        required: true,
    },
    Rapporteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher', // Model name for reference
        required: true,
    },
    PFE: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PFE', // Model name for reference
        required: true,
    },
    Publisher: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// Create and export the SoutenancePFe model
const DefensePFE = mongoose.model('DefensePFE', DefensePFESchema);
export default DefensePFE;