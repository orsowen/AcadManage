import mongoose from 'mongoose';

const { Schema } = mongoose;


const PFESchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        Nom_societe: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        documents: { type: [String], required: true },
        StartDate: { type: Date, required: true },
        EndDate: { type: Date, required: true },
        isValid: { type: Boolean, default: false },
        techList: { type: [String], required: true },
        affectation: { type: Boolean, default: false },
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    },
    { timestamps: true }
);

const PFE = mongoose.model('PFE', PFESchema, 'pfes'); // Explicit collection name
export default PFE;
