import mongoose from 'mongoose';
import { Schema } from 'mongoose';


const StudentSchema = new mongoose.Schema({
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    cin: {
        type: Number,
        required: true,
        unique: true, // CIN should be unique
        validate: {
            validator: Number.isInteger, // Ensure CIN is an integer
            message: 'CIN must be an integer value.',
        },
    },
    email: {
        type: String,
        required: true,
        unique: true, // Email should be unique
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Validate email format
    },
    phone: {
        type: String,
        required: false,
        match: /^\+?[0-9]{7,15}$/, // Optional: Validate phone number
    },
    arabicLastName: {
        type: String,
        // required: true
    },
    arabicFirstName: {
        type: String,
        // required: true
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
        enum: ["Male", "Female", "Homme", "Femme"],
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
        // required: true
    },
    isPrepa: {
        type: Boolean,
        // required: true
    },
    university: {
        type: String,
        // required: true
    },
    etablissement: {
        type: String,
        // required: true
    },

    speciality: {
        type: String,
        // required: true
    },
    licenseYear: {
        type: Number,
        // required: true
    },
    M1university: {
        type: String,
        // required: true
    },
    M1Etablissement: {
        type: String,
        // required: true
    },
    M1speciality: {
        type: String,
        // required: true
    },
    M1Year: {
        type: Number,
        // required: true
    },
    M1Type: {
        type: String,
        // required: true
    },
    cFil: {
        type: String,
        // required: true
    },
    scoreG: {
        type: Number,
        // required: true

    },
    bacYear: {
        type: Number,
        // required: true
    },
    address: {
        type: String,
        // required: true
    },
    choices: [{
        type: Schema.Types.ObjectId,
        ref: 'Choice',
    }],

});

export default mongoose.model('Student', StudentSchema);
