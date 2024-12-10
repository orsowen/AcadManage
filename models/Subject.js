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
                    name: {
                        type: String, // Nom de la section
                    },
                    status: {
                        type: String, // État : "En cours", "Terminé"
                        default: "En cours"
                    },
                    completedAt: {
                        type: Date, // Date de changement de statut
                        default: null
                    },
                },
            ],
            status: {
                type: String, // État du chapitre
                default: "En cours"
            },
            completedAt: {
                type: Date, // Date de changement de statut
                default: null
            },
        },
    ],
    teacher: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher', // Référence au modèle User
    }],
    
    students: [{  // Tableau d'ID d'étudiants
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
    }],

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