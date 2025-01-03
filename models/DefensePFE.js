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
    Heure: {
        type: String,  // Changement de Number à String
        required: true,
        match: /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/, // Validation du format HH:mm
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
    }, Encadrent: {
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
    }, emailStatus: { type: String, enum: ["none", "first", "second"], default: "none" },

}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// Create and export the SoutenancePFe model
const DefensePFE = mongoose.model('DefensePFE', DefensePFESchema);
export default DefensePFE;