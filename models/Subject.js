import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    
    skills: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
    }
],
    level: {
        type: String,
        required: true
    },

    semester: {
        type: Number,
        required: true
    },

    curriculum: [
        {
            chapter: {
                type: String,
                required: true, // Nom du chapitre
            },
            sections: [
                {
                    type: String, // Liste des sections dans le chapitre
                },
            ],
        },
    ],

    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Référence au modèle User (enseignant affecté)
    },

    published: {
        type: Boolean,
        required: false, 
    },

    option: {
        type: String,
        required: true
    },



    chargeHoraire: {
        type: Number,
        required: true
    },
   
    coeff: {
        type: Number,
        required: true
    },

    credit: {
        type: Number,
        required: true
    },
  
 
});

export default mongoose.model("Subject", SubjectSchema);