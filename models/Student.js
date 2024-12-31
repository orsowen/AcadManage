import mongoose from 'mongoose';

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
    birthDate: {
        type: Date,
        required: true
    },
    governorate: {
        type: String,
        required: true
    },
    academicHistory: {
        type: [
            {
                year: {
                    type: String,
                    required: true,
                },
                status: {
                    type: String,
                    required: true,
                    enum: ['Success', 'Failure', 'Pending'],
                    default: 'Pending',
                },
            },
        ],
        default: [], // Default to an empty array initially
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
    },
    choices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Choice',
    }],
    // Link to CV 
    cv: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CV", // Reference to CV model
    },
});

// Pre-save middleware to populate `academicHistory` with a default value if empty
StudentSchema.pre('save', function (next) {
    if (this.academicHistory.length === 0) {
        const currentYear = new Date().getFullYear();
        const month = new Date().getMonth();
        const academicYear =
            month >= 8
                ? `${currentYear}-${currentYear + 1}`
                : `${currentYear - 1}-${currentYear}`;

        this.academicHistory.push({
            year: academicYear,
            status: 'Pending',
        });
    }
    next();
});

export default mongoose.model('Student', StudentSchema);