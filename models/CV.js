import mongoose from 'mongoose';


const CvDetail = new mongoose.Schema({
    date: {
        type: String,
        required: false
    },
    Title: {
        type: String,
        required: true
    },
    titleDescription:{
        type: String,
        required: false
    },
    description: {
        type: [String],
        required: false
    }
});

const academicprojects = new mongoose.Schema({
    PFE: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: "PFE",
        required: false,
        efault:"still not terminal Studant"
    },
    /*PFA: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: "Subject_PFA",
        required: false,
        efault:"still not an engeneer or a master student"
    },*/
    Internship:{
        type:  [mongoose.Schema.Types.ObjectId],
        ref: "Internship",
        required:false,
        default:"not yet affected"
    },
});

const CVSchema = new mongoose.Schema({
    lastName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    Title:{
        type:String,
        required:true
    },
    phoneNum:{
        type: Number,
        required: true        
    },
    adress: {
        type: String,
        required: true
    },
    socialMediaLinks: {
        type: [String],
        required: true
    },
    
    competence: {
        type: [String],
        required: true
    },
    languages: {
        type: [CvDetail],
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    hobbies: {
        type: [String],
        required: true
    },
    WorkExperience: {
        type: [CvDetail],
        require: true
    },
    education: {
        type: [CvDetail],
        require: true
    },
    academicprojects:{
        type: academicprojects,
        required:false
    },
    objective: {
        type: String,
        required: true
    },
    Bio: {
        type: String,
        required: true
    },

    // Link to User 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to User model
    },
});

export default mongoose.model('CV', CVSchema);
