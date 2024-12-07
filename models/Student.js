import mongoose from 'mongoose';

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
        enum: ["ING1", "ING2", "ING3"],
        default: "ING1",
    },
    isGraduated: {
        type: Boolean,
        default: false
    },

    isArchived: {
        type: Boolean,
        default: false, // Default value
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
    cFil: {
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
});

export default mongoose.model('Student', StudentSchema);
