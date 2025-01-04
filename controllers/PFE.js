import { populate } from 'dotenv';
import DefensePFE from '../models/DefensePFE.js';
import PFE from '../models/PFE.js';
import { sendMail } from './mailer.js';
import Joi from 'joi';


const PFEValidationSchema = Joi.object({
    title: Joi.string().trim().required(),
    documents: Joi.object({
        ficheEval: Joi.string().trim().pattern(/\.(pdf|docx)$/i).required(),
        attestation: Joi.string().trim().pattern(/\.(pdf|docx)$/i).required(),
        rapport: Joi.string().trim().pattern(/\.(pdf|docx)$/i).required(),
    }).required(),
    StartDate: Joi.date().required(),
    EndDate: Joi.date().required(),
    Nom_societe: Joi.string().trim().required(),
    teacher: Joi.string().trim().optional(),
    topic: Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        techList: Joi.array().items(Joi.string().trim()).min(1).required(),
    }).required(),
});
// create  PFE
export const createPFE = async (req, res) => {
    const { error } = PFEValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { title, documents, StartDate, EndDate, Nom_societe, teacher, topic } = req.body;

    try {

        const student = req.user?.idRole;
        if (!student) {
            return res.status(403).json({
                error: "Student information is missing or user is not a student."
            });
        }

        // Validate topic details
        if (!topic || !topic.title || !topic.description || !topic.techList) {
            return res.status(400).json({ error: "PFE details  are incomplet." });
        }

        // Validate document fields
        if (!documents || !documents.ficheEval || !documents.attestation || !documents.rapport) {
            return res.status(400).json({ error: "PFE documents are incomplets." });
        }


        // Check if the student already has a PFE
        const existingPFE = await PFE.findOne({ student });
        if (existingPFE) {
            return res.status(400).json({
                error: "This student already has an assigned PFE topic."
            });
        }

        // Create the new PFE document
        const newPFE = new PFE({
            title,
            Nom_societe,
            topic: {
                title: topic.title,
                description: topic.description,
                techList: topic.techList,
            },
            documents,
            StartDate,
            EndDate,
            student,
            teacher
        });

        // Save the new PFE document to the database
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
        title, Nom_societe, documents, topic, StartDate, EndDate,
    } = req.body;

    try {
        if (new Date(StartDate) >= new Date(EndDate)) {
            return res.status(400).json({
                error: "StartDate must be earlier than EndDate."
            });
        }
        const archipfe = await PFE.find({ _id: id, isArchived: true });
        if (archipfe) {
            return res.status(400).json({
                error: "this pfe cannot be update it"
            });
        }
        const updatedPFE = await PFE.findOneAndUpdate(
            { _id: id },

            {
                title,
                Nom_societe,
                documents,
                topic,
                StartDate,
                EndDate
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
        const pfes = await PFE.find({ isArchived: false })
            .populate({
                path: 'student',
                populate: {
                    path: 'user',
                    select: 'email',
                },
            })
            .populate({
                path: 'Defense',
                populate: {
                    path: 'PFE',
                    select: '_id',
                },
            })
            .sort({ StartDate: -1 });

        // Map PFEs to include required details
        const response = pfes.map((pfe) => {
            return {
                PFE: {
                    title: pfe.title,
                    Nom_societe: pfe.Nom_societe,
                    documents: pfe.documents,
                    Topic: pfe.topic,
                    StartDate: pfe.StartDate,
                    EndDate: pfe.EndDate,
                    isValid: pfe.isValid,
                    techList: pfe.techList,
                    student: pfe.student
                        ? {
                            firstName: pfe.student.firstName,
                            lastName: pfe.student.lastName,
                            email: pfe.student.user?.email,
                            gender: pfe.student.gender,
                            governorate: pfe.student.governorate,
                            city: pfe.student.city,
                            postalCode: pfe.student.postalCode,
                            grade: pfe.student.grade,
                        }
                        : null,
                },
                Publisher: pfe.Publisher ? 'Published' : 'Hidden',
                defense: pfe.Defense
                    ? {
                        status: pfe.Defense.Publisher ? 'Available' : 'Not Published',
                        details: pfe.Defense,
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

    const teacherId = req.user?.idRole;

    try {
        const pfe = await PFE.findById(id);

        if (!pfe) {
            return res.status(404).json({
                error: "PFE not found."
            });
        }
        if (pfe.isArchived) {
            return res.status(404).json({
                error: "PFE is already archived"
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
//valide PFE
export const validateAssignments = async (req, res) => {
    try {
        const { ids } = req.body;

        // Find all PFEs with the given ids
        const pfes = await PFE.find({ _id: { $in: ids } });

        // Check if any PFE is missing
        if (pfes.length !== ids.length) {
            const missingIds = ids.filter(id => !pfes.some(pfe => pfe._id.toString() === id));
            return res.status(400).json({
                error: 'Some PFEs do not exist',
                missingIds,
            });
        }

        // Check if any PFE is archived
        const archivedPfes = pfes.filter(pfe => pfe.isArchived === true);
        if (archivedPfes.length > 0) {
            const archivedIds = archivedPfes.map(pfe => pfe._id.toString());
            return res.status(400).json({
                error: 'Some PFEs are archived and cannot be assigned',
                archivedIds,
            });
        }

        // Check if any PFE is missing a teacher assignment
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

//Assigne PFE to teacher
export const assignPFEToTeacher = async (req, res) => {
    const { id } = req.params; // PFE ID
    const { teacherId, force } = req.body;

    try {
        // Find the PFE by ID
        const pfe = await PFE.findById(id);

        if (!pfe) {
            return res.status(404).json({ error: "PFE not found." });
        }
        if (pfe.isArchived) {
            return res.status(404).json({
                error: "PFE is already archived"
            });
        }
        // Check if the PFE is already assigned to a teacher
        if (pfe.teacher) {
            if (force) {
                pfe.teacher = teacherId;
                await pfe.save();
                return res.status(200).json({
                    message: "PFE successfully reassigned to the new teacher.",
                    PFE: pfe,
                });
            } else {
                return res.status(400).json({
                    error: "This PFE is already assigned to another teacher. Use force=true to reassign.",
                });
            }
        }

        //assign the PFE to the teacher
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

//Publish Or Hide PFE
export const publishOrHidePFE = async (req, res) => {
    const { response } = req.params;

    try {
        if (!["publish", "hide"].includes(response)) {
            return res.status(400).json({
                error: "Invalid response. Expected 'publish' or 'hide'.",
            });
        }

        const isPublished = response === "publish";

        // Update all PFEs to the desired state
        const updatedPFEs = await PFE.updateMany(
            { isArchived: false },
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
        const pfes = await PFE.find({ isArchived: false, isPublished: true })
            .populate({
                path: 'student',
                populate: {
                    path: 'user',
                    select: 'email firstName lastName'
                }
            })
            .populate({
                path: 'teacher',
                populate: {
                    path: 'user',
                    select: 'email firstName lastName'
                }
            });

        if (!pfes.length) {
            return res.status(404).json({ message: 'No PFEs to send emails to.' });
        }

        // Loop through each PFE and send the email to both student and teacher
        for (let pfe of pfes) {
            if (!pfe.student || !pfe.student.user || !pfe.student.user.email) {
                console.warn(`No email found for student with ID ${pfe.student}`);
                continue;
            }

            if (!pfe.teacher || !pfe.teacher.user || !pfe.teacher.user.email) {
                console.warn(`No email found for teacher with ID ${pfe.teacher}`);
                continue;
            }
            let subject = '';
            let status = pfe.emailStatus;
            if (status === 'none') {
                subject = 'Your Planning Link';
                status = 'first';
            } else if (status === 'first') {
                subject = 'Your Planning Link Modified';
                status = 'second';
            } else {
                subject = 'Your Planning Link Modified';
            }
            const studentEmailContent = `
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background-color: rgb(32, 30, 129); color: white; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header img { float: left; height: 50px; margin-right: 15px; }
        .content { padding: 20px; }
        .content p { margin: 0 0 15px; line-height: 1.6; color: #555; }
        .content ul { padding-left: 20px; margin: 15px 0; }
        .content ul li { margin-bottom: 10px; color: #333; }
        .footer { background-color: #f2f2f2; color: #777; text-align: center; padding: 10px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://isa2m.rnu.tn/assets/img/logo-dark.png" alt="Logo">
            <h1>PFE Details</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${pfe.student.firstName} ${pfe.student.lastName}</strong>,</p>
            <p>Your PFE details:</p>
            <ul>
                <li><strong>Title:</strong> ${pfe.title}</li>
                <li><strong>Company:</strong> ${pfe.Nom_societe}</li>
                <li><strong>Description:</strong> ${pfe.topic.description}</li>
                <li><strong>Technologies:</strong> ${pfe.topic.techList.join(', ')}</li>
                <li><strong>Start Date:</strong> ${pfe.StartDate.toDateString()}</li>
                <li><strong>End Date:</strong> ${pfe.EndDate.toDateString()}</li>
                <li><strong>Teacher:</strong> ${pfe.teacher
                    ? `${pfe.teacher.firstName} ${pfe.teacher.lastName}`
                    : '<strong style="color: red;">You still have no supervisor assigned.</strong>'
                }</li>
            </ul>
            ${status === 'none'
                    ? '<p>This is the first time you are receiving these details. Please verify the information.</p>'
                    : '<p>This email includes updated information about your PFE.</p>'
                }
            <p>Best regards,<br>Admin Team</p>
        </div>
        <div class="footer">
            <p>© 2025 Isamm. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
`;

            const teacherEmailContent = `
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background-color: rgb(32, 30, 129); color: white; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header img { float: left; height: 50px; margin-right: 15px; }
        .content { padding: 20px; }
        .content p { margin: 0 0 15px; line-height: 1.6; color: #555; }
        .content ul { padding-left: 20px; margin: 15px 0; }
        .content ul li { margin-bottom: 10px; color: #333; }
        .footer { background-color: #f2f2f2; color: #777; text-align: center; padding: 10px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://isa2m.rnu.tn/assets/img/logo-dark.png" alt="Logo">
            <h1>PFE Supervision Details</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${pfe.teacher.firstName} ${pfe.teacher.lastName}</strong>,</p>
            <p>You are assigned to supervise the following PFE:</p>
            <ul>
                <li><strong>Title:</strong> ${pfe.title}</li>
                <li><strong>Company:</strong> ${pfe.Nom_societe}</li>
                <li><strong>Assigned Student:</strong> ${pfe.student.firstName} ${pfe.student.lastName}</li>
            </ul>
            ${status === 'first'
                    ? '<p>This is the first time you are receiving these details. Please verify the information.</p>'
                    : '<p>This email includes updated information about your PFE.</p>'
                }
            <p>Best regards,<br>Admin Team</p>
        </div>
        <div class="footer">
            <p>© 2025 Isamm. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
`;
            // Send email to the student
            await sendMail(pfe.student.user.email, subject, emailContent);
            await sendMail(pfe.teacher.user.email, subject, teacherEmailContent);

            // Update the PFE document with the new email status
            pfe.emailStatus = status;
            await pfe.save();


        }


        return res.status(200).json({
            message: `${pfes.length}   PFE emails sent successfully.`,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error sending emails.' });
    }
};

export const getTeacherDefenses = async (req, res) => {
    try {
        const teacherId = req.user.idRole; // Extract teacher ID from authenticated user

        // Find defenses where the teacher is president, rapporteur, or the supervisor (Encadrent)
        const defenses = await DefensePFE.find({
            $or: [
                { PresidentJury: teacherId },
                { Rapporteur: teacherId },
                { Encadrent: teacherId },
            ],
            isArchived: false,
            isPublished: true,
        })
            .populate({
                path: "PresidentJury",
                select: "firstName lastName ",
            })
            .populate({
                path: "Rapporteur",
                select: "firstName lastName ",
            })
            .populate({
                path: "Encadrent",
                select: "firstName lastName ",
            })
            .populate({
                path: "PFE",
                populate: {
                    path: "student",
                    select: "firstName lastName",
                    populate: {
                        path: "user",
                        select: "email"
                    }
                }
            });

        if (!defenses || defenses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No defenses found for this teacher.",
            });
        }

        // Map the defenses to include the teacher's role
        const defensesWithRoles = defenses.map((defense) => {
            let role = null;
            if (defense.PresidentJury?._id.toString() === teacherId) {
                role = "President";
            } else if (defense.Rapporteur?._id.toString() === teacherId) {
                role = "Rapporteur";
            } else if (defense.Encadrent?._id.toString() === teacherId) {
                role = "Encadrent";
            }

            return {
                ...defense.toObject(),
                teacherRole: role, // Add the teacher's role for this defense
            };
        });

        res.status(200).json({
            success: true,
            data: defensesWithRoles,
        });
    } catch (error) {
        console.error("Error fetching teacher defenses:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching defenses.",
            error: error.message,
        });
    }
};
export const getStudentPFE = async (req, res) => {
    try {
        const student = req.user?.idRole;
        const pfeData = await PFE.findOne({ student: student, isPublished: true })
            .populate({
                path: 'student',
                select: 'lastName firstName',
                populate: {
                    path: 'user', // Populate the user field
                    select: 'email' // Select the email field from the user model
                }
            }).populate({
                path: 'Defense',
                populate: [
                    {
                        path: 'PresidentJury',
                        select: 'firstName lastName', // Select only firstName and lastName
                        populate: {
                            path: 'user', // Populate the user field
                            select: 'email' // Select the email field from the user model
                        }
                    },
                    {
                        path: 'Rapporteur',
                        select: 'firstName lastName', // Select only firstName and lastName
                        populate: {
                            path: 'user', // Populate the user field
                            select: 'email' // Select the email field from the user model
                        }
                    },
                    {
                        path: 'Encadrent',
                        select: 'firstName lastName', // Select only firstName and lastName
                        populate: {
                            path: 'user', // Populate the user field
                            select: 'email' // Select the email field from the user model
                        }
                    }
                ]
            });

        if (!pfeData) {
            console.log('No PFE project found for the student.');
            return;
        }

        console.log('PFE Data:', pfeData);
    } catch (error) {
        console.error("Error fetching PFE project:", error);
    }
};