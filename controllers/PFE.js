import DefensePFE from '../models/DefensePFE.js';
import DepositPeriod from '../models/DepositPeriod.js';
import PFE from '../models/PFE.js';
import User from '../models/User.js';
import { sendMail } from './mailer.js';

export const createPFE = async (req, res) => {
    const {
        title, description, Nom_societe, techList, teacher,
        StartDate, EndDate, documents
    } = req.body;

    try {
        const student = req.user?.idRole; // Ensure middleware populates `req.user` with decoded token data
        if (!student) {
            return res.status(403).json({
                error: "Student information is missing from the token."
            });
        }

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
        // Fetch PFEs with populated student data and sort by StartDate descending
        const pfes = await PFE.find()
            .populate({
                path: 'student',
                populate: {
                    path: 'user',
                    select: 'email', // Only fetch email from the User model
                },
            })// Populate all student fields
            .sort({ StartDate: -1 });

        // Fetch all defenses
        const defenses = await DefensePFE.find();

        // Map PFEs to include required details
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
                    student: pfe.student
                        ? {
                            firstName: pfe.student.firstName,
                            lastName: pfe.student.lastName,
                            email: pfe.student.user.email,
                            gender: pfe.student.gender,
                            governorate: pfe.student.governorate,
                            city: pfe.student.city,
                            postalCode: pfe.student.postalCode,
                            grade: pfe.student.grade,
                        }
                        : null,
                },
                Publisher: pfe.Publisher ? 'Published' : 'Hidden',
                defense: defense
                    ? {
                        status: defense.Publisher ? 'Available' : 'Not Published',
                        details: defense,
                    }
                    : { status: 'Not Available', details: null },
            };
        });

        res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.error("Error retrieving PFE information:", error);
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

    const teacherId = req.user?.idRole; // Ensure middleware populates `req.user` with decoded token data

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

        // Fetch PFEs by the given IDs
        const pfes = await PFE.find({ _id: { $in: ids } });
        // Check if any PFE is missing
        if (pfes.length !== ids.length) {
            // Find the missing IDs
            const missingIds = ids.filter(id => !pfes.some(pfe => pfe._id.toString() === id));
            return res.status(400).json({
                error: 'Some PFEs do not exist',
                missingIds,
            });
        }
        // Check for missing teacher assignments
        const errors = pfes.filter(pfe => !pfe.teacher);

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Some PFEs are missing teacher assignments',
                errors
            });
        }

        // Update the 'isAssigned' field to true for the matched PFEs
        await PFE.updateMany(
            { _id: { $in: ids } },
            { $set: { isAssigned: true } }
        );

        res.status(200).json({ message: 'Assignments validated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const assignPFEToTeacher = async (req, res) => {
    const { id } = req.params; // PFE ID
    const { teacherId, force } = req.body;

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




// Function to send email and update emailStatus for all PFEs
export const sendPlanningEmail = async (req, res) => {
    try {
        // Get all PFEs that need to have an email sent
        const pfes = await PFE.find({ emailStatus: { $in: ['none', 'first'] } })
            .populate({
                path: 'student', // Populate the student field
                populate: {
                    path: 'user', // Populate the user field inside student
                    select: 'email firstName lastName' // Select email, firstName, and lastName from User
                }
            })
            .populate({
                path: 'teacher', // Populate the teacher field
                populate: {
                    path: 'user', // Populate the user field inside teacher
                    select: 'email firstName lastName' // Select email, firstName, and lastName from User
                }
            });

        if (!pfes.length) {
            return res.status(404).json({ message: 'No PFEs to send emails to.' });
        }

        // Loop through each PFE and send the email to both student and teacher
        for (let pfe of pfes) {
            // Ensure the student field is populated with student data
            if (!pfe.student || !pfe.student.user || !pfe.student.user.email) {
                console.warn(`No email found for student with ID ${pfe.student}`);
                continue; // Skip this PFE if there's no student or email
            }

            // Ensure the teacher field is populated with teacher data
            if (!pfe.teacher || !pfe.teacher.user || !pfe.teacher.user.email) {
                console.warn(`No email found for teacher with ID ${pfe.teacher}`);
                continue; // Skip this PFE if there's no teacher or email
            }
            let subject = '';
            let status = pfe.emailStatus;
            // Create the email content
            const emailContent = `
        <p>Dear ${pfe.student.firstName} ${pfe.student.lastName},</p>
                <p>Your PFE details:</p>
                <ul>
                    <li>Title: ${pfe.title}</li>
                    <li>Company: ${pfe.Nom_societe}</li>
                    <li>Description: ${pfe.description}</li>
                    <li>Technologies: ${pfe.techList.join(', ')}</li>
                    <li>Start Date: ${pfe.StartDate.toDateString()}</li>
                    <li>End Date: ${pfe.EndDate.toDateString()}</li>
                    <li> Teacher${pfe.teacher.firstName} ${pfe.teacher.lastName}<li>
                </ul>
    ${status === 'none'
                    ? '<p>This is the first time you are receiving these details. Please verify the information.</p>'
                    : '<p>This email includes updated information about your PFE.</p>'
                }
                <p>Best regards,<br>Admin Team</p>
            `;
            // Determine the email subject and content based on the current email status




            // Send email to the teacher
            const teacherEmailContent = `
        <p>Dear ${pfe.teacher.firstName} ${pfe.teacher.lastName},</p>
                <p>You are assigned to supervise the following PFE:</p>
                <ul>
                    <li>Title: ${pfe.title}</li>
                    <li>Company: ${pfe.Nom_societe}</li>
                    <li>Assigned Student: ${pfe.student.firstName} ${pfe.student.lastName}</li>
                </ul>
    ${status === 'none'
                    ? '<p>This is the first time you are receiving these details. Please verify the information.</p>'
                    : '<p>This email includes updated information about your PFE.</p>'
                }
                <p>Best regards,<br>Admin Team</p>
            `;
            if (status === 'none') {
                subject = 'Your Planning Link';
                status = 'first'; // Update status to "first"
            } else if (status === 'first') {
                subject = 'Reminder: Your Planning Link';
                status = 'second'; // Update status to "second"
            } else {
                continue; // Skip sending email if already sent twice
            }

            // Send email to the student
            await sendMail(pfe.student.user.email, subject, emailContent);
            await sendMail(pfe.teacher.user.email, subject, teacherEmailContent);

            // Update the PFE document with the new email status
            pfe.emailStatus = status;
            await pfe.save();


        }


        return res.status(200).json({
            message: `${pfes.length} emails sent successfully.`,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error sending emails.' });
    }
};




