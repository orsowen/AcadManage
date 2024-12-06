
import DepositPeriod from '../models/DepositPeriod.js';
import PFE from '../models/PFEe.js';
import SoutenancePFe from '../models/SoutenancePFe.js';


export const createPFE = async (req, res) => {
    const {
        title, description, Nom_societe, techList, teacher,
        StartDate, EndDate, student, documents
    } = req.body;

    try {
        // Check if the current period allows PFE deposits
        const currentPeriod = await DepositPeriod.findOne({
            For: "PFE",
            Start_Deposit: { $lte: new Date() },
            End_Deposit: { $gte: new Date() }
        });

        if (!currentPeriod) {
            return res.status(403).json({
                error: "Les sujets PFE ne peuvent être créés que pendant la période de dépôt."
            });
        }

        // Check if the student already has a PFE
        const existingPFE = await PFE.findOne({ student });

        if (existingPFE) {
            return res.status(400).json({
                error: "Cet étudiant a déjà un sujet PFE assigné."
            });
        }

        // Create the new PFE
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

        // Save the PFE in the database
        const savedPFE = await newPFE.save();

        res.status(201).json({
            message: "PFE créé avec succès !",
            PFE: savedPFE
        });
    } catch (error) {
        res.status(500).json({
            error: "Échec de la création du PFE.",
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


export const ListAllPFEInfo = async (req, res) => {
    try {
        // Fetch all PFE documents
        const pfes = await PFE.find()
            .populate('student', 'name email') // Populate student details
            .populate('teacher', 'name email') // Populate teacher details
            .sort({ StartDate: -1 }); // Sort by StartDate in descending order

        // Fetch all soutenances
        const soutenances = await SoutenancePFe.find();

        // Build the response
        const response = pfes.map((pfe) => {
            const soutenance = soutenances.find((s) => s.PFE.toString() === pfe._id.toString());

            return {
                PFE: {
                    title: pfe.title,
                    Nom_societe: pfe.Nom_societe,
                    description: pfe.description,
                    documents: pfe.documents,
                    StartDate: pfe.StartDate,
                    EndDate: pfe.EndDate,
                    isValid: pfe.isValid,
                    techList: pfe.techList,
                    student: pfe.student,
                    teacher: pfe.teacher,
                },
                Affectation: pfe.affectation ? 'Affichée' : 'Masquée',
                Soutenance: soutenance
                    ? soutenance.Publisher
                        ? 'Affichée'
                        : 'Masquée'
                    : 'Non planifiée',
            };
        });

        // Return response
        res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des informations PFE',
            error: error.message,
        });
    }
};

export const choosePFE = async (req, res) => {
    const { id } = req.params; // PFE ID
    const { teacherId } = req.body; // Teacher making the choice

    try {
        // Find the PFE by ID
        const pfe = await PFE.findById(id);

        if (!pfe) {
            return res.status(404).json({ error: "PFE not found." });
        }

        // Check if the PFE is already assigned to another teacher
        if (pfe.teacher) {
            return res.status(400).json({
                error: "This PFE is already assigned to another teacher.",
            });
        }

        // Assign the PFE to the teacher
        pfe.teacher = teacherId;

        // Save the updated PFE
        const updatedPFE = await pfe.save();

        res.status(200).json({
            message: "PFE successfully assigned to the teacher.",
            PFE: updatedPFE,
        });
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while assigning the PFE.",
            details: error.message,
        });
    }
};
