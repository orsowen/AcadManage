import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const EtudiantSchema = new Schema({
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    }, 
    nomArab: {
        type: String,
        required: true
    },
    prenomArab: {
        type: String,
        required: true
    },
    cin: {
        type: Number,
        required: true
    },
    dateNaissance: {
        type: Date,
        required: true
    },
    gouvernorat: {
        type: String,
        required: true
    },
    sexe: {
        type: String,
        required: true
    },
    ville: {
        type: String,
        required: true
    },
    codePostal: {
        type: Number,
        required: true
    },
    nationalite: {
        type: String,
        required: true
    },
    bac: {
        type: String,
        required: true
    },
    mention: {
        type: String,
        required: true
    },
    estprepa: {
        type: Boolean,
        required: true
    },
    universite: {
        type: String,
        required: true
    },
    etablissement: {
        type: String,
        required: true
    },
    specialite: {
        type: String,
        required: true
    },
    anneeLicense: {
        type: Number,
        required: true
    },
    M1universite: {
        type: String,
        required: true
    },
    M1etablissement: {
        type: String,
        required: true
    },
    M1specialite: {
        type: String,
        required: true
    },
    M1annee: {
        type: Number,
        required: true
    },
    M1type: {
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
    anneeBac: {
        type: Number,
        required: true
    },
    telephone: {
        type: String,
        required: true
    },
    adresse: {
        type: String,
        required: true
    },
    
});

export default mongoose.model('Etudiant', EtudiantSchema);