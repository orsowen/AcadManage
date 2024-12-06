
import DepositPeriod from '../models/DepositPeriod.js';
import PFE from '../models/PFEe.js';


export const createPFE = async (req, res) => {
    const {
        title, description, Nom_societe, techList, teacher,
        StartDate, EndDate, student, documents
    } = req.body;

    try {
        const currentPeriod = await DepositPeriod.findOne({
            For: "PFE",
            Start_Deposit: { $lte: new Date() },
            End_Deposit: { $gte: new Date() }
        });

        if (!currentPeriod) {
            return res.status(403).json({ error: "Les sujets PFE ne peuvent pas être Cree que dans pendant la période de dépôt." });
        }



        const newPFE = new PFE({
            title,
            Nom_societe,
            documents,
            description,
            techList,
            StartDate,
            EndDate,
            student,
            teacher
        });

        const savedPFE = await newPFE.save();

        res.status(201).json({
            message: " PFE created successfully!",
            PFE: savedPFE
        });

    } catch (error) {
        res.status(500).json({
            error: "Failed to create  PFE.",
            details: error.message
        });
    }
};



export const updatePFE = async (req, res) => {
    const { id } = req.params;
    const {
        title, description, Nom_societe, techList, teacher,
        StartDate, EndDate, documents, student
    } = req.body;

    try {
        // Step 1: Check if the current date is within the deposit period for PFE topics
        const currentPeriod = await DepositPeriod.findOne({
            For: "PFE",
            Start_Deposit: { $lte: new Date() },
            End_Deposit: { $gte: new Date() }
        });

        if (!currentPeriod) {
            return res.status(403).json({ error: "Les sujets PFE ne peuvent pas être modifiés que pendant la période de dépôt." });
        }

        const updatedPFE = await PFE.findOneAndUpdate(
            { id },
            {
                title,
                Nom_societe,
                StartDate,
                description,
                techList,
                EndDate,
                documents,
                student,
                teacher
            },
            { new: true, runValidators: true }
        );

        if (!updatedPFE) {
            return res.status(404).json({ error: "PFE non trouvé pour ce sujet." });
        }

        // Step 4: Return the updated PFE Topic and PFE
        res.status(200).json({
            message: "PFE Topic and associated PFE updated successfully!",
            updatedPFE
        });

    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la mise à jour du sujet.", details: error.message });
    }
};