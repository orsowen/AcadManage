
import DepositPeriod from '../models/DepositPeriod.js';
import PFETopic from '../models/PFETopic.js';
import Internship from '../models/Internship.js';

export const createPFEWithInternship = async (req, res) => {
    const {
        title, description, Nom_societe, techList, teacher,
        StartDate, EndDate, student, documents
    } = req.body;

    try {
        // Step 1: Create the PFE Topic
        const newPFETopic = new PFETopic({
            title,
            description,
            Nom_societe,
            techList,
            teacher
        });

        const savedPFETopic = await newPFETopic.save();

        // Step 2: Create the Internship linked to the PFE Topic
        const newInternship = new Internship({
            title,
            Type: "PFE",
            documents,
            StartDate,
            EndDate,
            topic: savedPFETopic._id,
            student,
            teacher
        });

        const savedInternship = await newInternship.save();

        // Step 3: Send a success response
        res.status(201).json({
            message: "PFE Topic and Internship created successfully!",
            pfeTopic: savedPFETopic,
            internship: savedInternship
        });

    } catch (error) {
        res.status(500).json({
            error: "Failed to create PFE Topic and Internship.",
            details: error.message
        });
    }
};



export const updatepfeInternship = async (req, res) => {
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
            return res.status(403).json({ error: "Les sujets PFE ne peuvent pas être modifiés pendant la période de dépôt." });
        }

        // Step 2: Update the PFE Topic
        const updatedTopic = await PFETopic.findByIdAndUpdate(
            id,
            { title, description, Nom_societe, techList, teacher },
            { new: true, runValidators: true }
        );

        if (!updatedTopic) {
            return res.status(404).json({ error: "Sujet PFE non trouvé." });
        }

        // Step 3: Update the associated Internship
        const updatedInternship = await Internship.findOneAndUpdate(
            { topic: id },
            {
                title,
                StartDate,
                EndDate,
                documents,
                student,
                teacher
            },
            { new: true, runValidators: true }
        );

        if (!updatedInternship) {
            return res.status(404).json({ error: "Internship non trouvé pour ce sujet." });
        }

        // Step 4: Return the updated PFE Topic and Internship
        res.status(200).json({
            message: "PFE Topic and associated Internship updated successfully!",
            updatedTopic,
            updatedInternship
        });

    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la mise à jour du sujet.", details: error.message });
    }
};