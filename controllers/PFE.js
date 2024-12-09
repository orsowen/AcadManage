import DefensePFE from '../models/DefensePFE.js';
import DepositPeriod from '../models/DepositPeriod.js';
import PFE from '../models/PFE.js';
import User from '../models/User.js';
import { sendMail } from './mailer.js';

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


export const validateAssignments = async (req, res) => {
    try {
        const { ids } = req.body;
        const pfes = await PFE.findAll({ where: { id: ids } });
        const errors = pfes.filter(pfe => !pfe.teacherId);

        if (errors.length > 0) return res.status(400).json({ error: 'Some PFEs are missing teacher assignments', errors });

        await PFE.update({ isAssigned: true }, { where: { id: ids } });
        res.status(200).json({ message: 'Assignments validated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const assignPFEToTeacher = async (req, res) => {
    const { id } = req.params; // PFE ID
    const { teacherId, force } = req.body; // Teacher ID and force flag

    try {
        // Find the PFE by ID
        const pfe = await PFE.findById(id);

        if (!pfe) {
            return res.status(404).json({ error: "PFE not found." });
        }

        // Check if the PFE is already assigned to a teacher
        if (pfe.teacher) {
            if (force) {
                // If force is true, unassign from the current teacher and assign to the new teacher
                pfe.teacher = teacherId;
                await pfe.save();
                return res.status(200).json({
                    message: "PFE successfully reassigned to the new teacher.",
                    PFE: pfe,
                });
            } else {
                // If force is false, return an error
                return res.status(400).json({
                    error: "This PFE is already assigned to another teacher. Use force=true to reassign.",
                });
            }
        }

        // If not assigned, assign the PFE to the teacher
        pfe.teacher = teacherId;
        await pfe.save();

        res.status(200).json({
            message: "PFE successfully assigned to the teacher.",
            PFE: pfe,
        });
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while assigning the PFE.",
            details: error.message,
        });
    }
};

import PFE from '../models/PFE.js';

export const publishOrHidePFE = async (req, res) => {
    const { response } = req.params; // Expected values: "publish" or "hide"

    try {
        // Validate response parameter
        if (!["publish", "hide"].includes(response)) {
            return res.status(400).json({
                error: "Invalid response. Expected 'publish' or 'hide'.",
            });
        }

        // Determine the desired state
        const isPublished = response === "publish";

        // Update all PFEs to the desired state
        const updatedPFEs = await PFE.updateMany(
            {},
            { $set: { Publisher: isPublished } }
        );

        if (updatedPFEs.matchedCount === 0) {
            return res.status(404).json({
                error: "No PFEs found to update.",
            });
        }

        res.status(200).json({
            message: isPublished
                ? "All PFEs successfully published."
                : "All PFEs successfully hidden.",
            details: updatedPFEs,
        });
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while updating the PFEs.",
            details: error.message,
        });
    }
};


export const sendPlanningEmails = async (req, res) => {
    try {
        // Fetch all PFEs with associated data
        const allPFEs = await PFE.find()
            .populate('student', '_id') // Populate student ID
            .populate('teacher', '_id'); // Populate teacher ID

        // Fetch students and teachers from the User model
        const userIds = [
            ...allPFEs.map((pfe) => pfe.student?._id).filter(Boolean),
            ...allPFEs.map((pfe) => pfe.teacher?._id).filter(Boolean),
        ];
        const users = await User.find({ $or: [{ _id: { $in: userIds } }] });

        const emailsToSend = [];

        // Build emails for students and teachers
        for (const pfe of allPFEs) {
            const isFirstEnvoi = !pfe.emailStatus || pfe.emailStatus === 'first';

            // Email content changes based on whether it's the first or second email
            const studentEmailContent = `
                <p>Dear Student,</p>
                <p>Your PFE details:</p>
                <ul>
                    <li>Title: ${pfe.title}</li>
                    <li>Company: ${pfe.Nom_societe}</li>
                    <li>Description: ${pfe.description}</li>
                    <li>Technologies: ${pfe.techList.join(', ')}</li>
                    <li>Start Date: ${pfe.StartDate.toDateString()}</li>
                    <li>End Date: ${pfe.EndDate.toDateString()}</li>
                </ul>
                ${isFirstEnvoi
                    ? '<p>This is the first time you are receiving these details. Please verify the information.</p>'
                    : '<p>This email includes updated information about your PFE.</p>'
                }
                <p>Best regards,<br>Admin Team</p>
            `;

            const teacherEmailContent = `
                <p>Dear Teacher,</p>
                <p>You are assigned to supervise the following PFE:</p>
                <ul>
                    <li>Title: ${pfe.title}</li>
                    <li>Company: ${pfe.Nom_societe}</li>
                    <li>Assigned Student: ${pfe.student?.cin || 'N/A'}</li>
                </ul>
                ${isFirstEnvoi
                    ? '<p>This is the first time you are receiving this assignment. Please verify the information.</p>'
                    : '<p>This email includes updated information about the PFE assignment.</p>'
                }
                <p>Best regards,<br>Admin Team</p>
            `;

            // Find student user
            const studentUser = users.find((user) => user.student?.toString() === pfe.student?.toString());
            if (studentUser?.email) {
                emailsToSend.push(
                    sendMail(studentUser.email, 'Your PFE Assignment', studentEmailContent)
                );
            }

            // Find teacher user
            const teacherUser = users.find((user) => user.teacher?.toString() === pfe.teacher?.toString());
            if (teacherUser?.email) {
                emailsToSend.push(
                    sendMail(teacherUser.email, 'PFE Assignments', teacherEmailContent)
                );
            }

            // Update PFE email status
            pfe.emailStatus = isFirstEnvoi ? 'second' : 'resend';
            await pfe.save();
        }

        // Send all emails
        await Promise.all(emailsToSend);

        res.status(200).json({ message: 'Planning emails sent successfully.' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ error: 'Failed to send planning emails.', details: error.message });
    }
};
