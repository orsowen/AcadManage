import DepositPeriod from '../models/DepositPeriod.js';
import PFE from '../models/PFE.js';
import DefensePFE from '../models/DefensePFE.js';

// Create a new PFE
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
                error: "PFE topics can only be created during the deposit period."
            });
        }

        // Check if the student already has a PFE
        const existingPFE = await PFE.findOne({ student });

        if (existingPFE) {
            return res.status(400).json({
                error: "This student already has an assigned PFE topic."
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
            message: "PFE successfully created!",
            PFE: savedPFE
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to create the PFE.",
            details: error.message
        });
    }
};

// Update an existing PFE
export const updatePFE = async (req, res) => {
    const { id } = req.params;
    const {
        title, description, Nom_societe, techList, teacher,
        StartDate, EndDate, documents, student
    } = req.body;

    try {
        // Check if the current date is within the deposit period for PFE topics
        const currentPeriod = await DepositPeriod.findOne({
            For: "PFE",
            Start_Deposit: { $lte: new Date() },
            End_Deposit: { $gte: new Date() }
        });

        if (!currentPeriod) {
            return res.status(403).json({
                error: "PFE topics can only be updated during the deposit period."
            });
        }

        const updatedPFE = await PFE.findOneAndUpdate(
            { _id: id },
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
            return res.status(404).json({
                error: "PFE not found for this topic."
            });
        }

        res.status(200).json({
            message: "PFE topic and associated PFE updated successfully!",
            updatedPFE
        });
    } catch (error) {
        res.status(500).json({
            error: "Error occurred while updating the topic.",
            details: error.message
        });
    }
};

// List all PFE information
export const ListAllPFEInfo = async (req, res) => {
    try {
        const pfes = await PFE.find()
            .populate('student', 'firstName lastName email ')
            .populate('teacher', 'name email')
            .sort({ StartDate: -1 });

        const defenses = await DefensePFE.find();

        const response = pfes.map((pfe) => {
            const defense = defenses.find((d) => d.PFE.toString() === pfe._id.toString());

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
                    student: {
                        id: pfe.student?._id,
                        firstName: pfe.student?.firstName,
                        lastName: pfe.student?.lastName,
                        email: pfe.student?.email,
                        gender: pfe.student?.gender,
                        governorate: pfe.student?.governorate,
                        city: pfe.student?.city,
                        postalCode: pfe.student?.postalCode,
                        grade: pfe.student?.grade,
                        isGraduated: pfe.student?.isGraduated,
                    },
                    teacher: pfe.teacher || null,
                },
                isAssigned: pfe.isAssigned ? 'Assigned' : 'Not Assigned',
                defense: defense && defense.Publisher
                    ? { status: 'Available', details: defense }
                    : { status: 'Not Available', details: null },
            };
        });

        res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving PFE information',
            error: error.message,
        });
    }
};

// Choose a PFE for a teacher
export const choosePFE = async (req, res) => {
    const { id } = req.params;
    const { teacherId } = req.body;

    try {
        const pfe = await PFE.findById(id);

        if (!pfe) {
            return res.status(404).json({
                error: "PFE not found."
            });
        }

        if (pfe.teacher) {
            return res.status(400).json({
                error: "This PFE is already assigned to another teacher."
            });
        }

        pfe.teacher = teacherId;

        const updatedPFE = await pfe.save();

        res.status(200).json({
            message: "PFE successfully assigned to the teacher.",
            PFE: updatedPFE,
        });
    } catch (error) {
        res.status(500).json({
            error: "Error occurred while assigning the PFE.",
            details: error.message,
        });
    }
};
