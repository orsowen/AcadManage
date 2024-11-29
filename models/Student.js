import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    lastName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
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
        required: true
    },
    isprepa: {
        type: Boolean,
        required: true
    },
    university: {
        type: String,
        required: true
    },
    etablissement: {
        type: String,
        required: true
    },
    speciality: {
        type: String,
        required: true
    },
    licenseYear: {
        type: Number,
        required: true
    },
    M1university: {
        type: String,
        required: true
    },
    M1etablissement: {
        type: String,
        required: true
    },
    M1speciality: {
        type: String,
        required: true
    },
    M1Year: {
        type: Number,
        required: true
    },
    M1Type: {
        type: String,
        required: true
    },
    cfil: {
        type: String,
        required: true
    },
    scoreG:{
        type: Number,
        required: true
    },         
    bacYear: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    
});

export default mongoose.model('Student', StudentSchema);