import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const StudentSchema = new mongoose.Schema({
    lastName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },

    arabicLastName: {
        type: String,
        required: true
    },
    arabicFirstName: {
        type: String,
        required: true
    },
    cin: {
        type: Number,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    governorate: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    postalCode: {
        type: Number,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    bac: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        enum: ["ING1", "ING2", "ING3"],
        default: "ING1",
    },
    isprepa: {
        type: Boolean,
        default: false
    },
    isPrepa: {
        type: Boolean,
    },
    university: {
        type: String,
    },
    etablissement: {
        type: String,
    },
    speciality: {
        type: String,
    },
    licenseYear: {
        type: Number,
    },
    M1university: {
        type: String,
    },
    M1Etablissement: {
        type: String,
    },
    M1speciality: {
        type: String,
    },
    M1Year: {
        type: Number,
    },
    M1Type: {
        type: String,
    },
    cfil: {
        type: String,
    },
    scoreG: {
        type: Number,
    },
    bacYear: {
        type: Number,
    },
    address: {
        type: String,
    },
    // Link to User 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to User model
        // default: null,
    },
    choices: [{
        type: Schema.Types.ObjectId,
        ref: 'Choice',
    }],
});

export default mongoose.model('Student', StudentSchema);
