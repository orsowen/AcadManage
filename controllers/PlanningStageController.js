import Internship from '../models/Internship.js';
import PlanningStage from '../models/PlanningStage.js';
import { sendMail } from './mailer.js';

// Create a new Planning Stage
export const createPlanningStage = async (req, res) => {
    const teacherId = req.user.idRole; // Extract teacher ID from JWT token
    const role = req.user.role; // Extract role from JWT token
    const { horaire, day, meet_link, internship, sendMail: shouldSendMail } = req.body;

    try {
        // Check if internship exists and populate necessary details
        const internshipDoc = await Internship.findById(internship)
            .populate({
                path: "student",
                select: "firstName lastName user",
                populate: {
                    path: "user",
                    select: "email",
                },
            })
            .populate({
                path: "teacher",
                select: "firstName lastName user",
                populate: {
                    path: "user",
                    select: "email",
                },
            })
            .populate({
                path: "topic",
                select: "title description techList",
            });

        if (!internshipDoc) {
            return res.status(404).json({ error: "Internship not found." });
        }

        // Check if a planning stage already exists for this internship
        const existingPlanningStage = await PlanningStage.findOne({ internship });
        if (existingPlanningStage) {
            return res.status(400).json({ error: "Planning for this internship already exists." });
        }

        // Ensure the user is authorized to plan this stage (teacher or admin)
        if (!internshipDoc.teacher || (teacherId !== internshipDoc.teacher.toString() && role !== "admin")) {
            return res.status(403).json({ error: internshipDoc.teacher ? "Unauthorized to plan this stage." : "No teacher assigned to the internship." });
        }

        // Create the new planning stage
        const newPlanningStage = new PlanningStage({
            horaire,
            day,
            meet_link,
            internship,
            sendStatus: "Not Sent", // Default status
        });

        // Save the new planning stage to the database
        const savedPlanningStage = await newPlanningStage.save();

        // Optionally send an email to the student with planning details
        if (shouldSendMail) {
            const studentEmail = internshipDoc.student?.user?.email;
            const studentName = `${internshipDoc.student?.firstName} ${internshipDoc.student?.lastName}`;
            const teacherName = `${internshipDoc.teacher?.firstName} ${internshipDoc.teacher?.lastName}`;
            const teacherEmail = internshipDoc.teacher?.user?.email;
            const topicTitle = internshipDoc.topic?.title || "Non spécifié";
            const topicDescription = internshipDoc.topic?.description || "Non spécifié";
            const techList = internshipDoc.topic?.techList?.join(", ") || "Non spécifiées";

            if (studentEmail) {
                const subject = "Détails de votre planning de stage";
                const message = `
                    <p>Bonjour ${studentName},</p>
                    <p>Voici les détails de votre planning :</p>
                    <ul>
                        <li><strong>Horaire :</strong> ${horaire}</li>
                        <li><strong>Jour :</strong> ${day}</li>
                        <li><strong>Lien de réunion :</strong> <a href="${meet_link}">${meet_link}</a></li>
                        <li><strong>Enseignant :</strong> ${teacherName}</li>
                        <li><strong>Email enseignant :</strong> ${teacherEmail || "Non disponible"}</li>
                        <li><strong>Sujet :</strong> ${topicTitle}</li>
                        <li><strong>Description :</strong> ${topicDescription}</li>
                        <li><strong>Technologies :</strong> ${techList}</li>
                    </ul>
                    <p>Cordialement,</p>
                    <p>L'équipe de gestion de stages</p>
                `;

                await sendMail(studentEmail, subject, message);

                // Update sendStatus to "First Sent"
                savedPlanningStage.sendStatus = "First Sent";
                await savedPlanningStage.save();

                console.log("Email sent to student and status updated.");
            } else {
                console.warn("Student email not found, skipping email sending.");
            }
        }

        // Respond with the created planning stage
        res.status(201).json({
            message: "Planning stage created successfully.",
            savedPlanningStage,
        });
    } catch (error) {
        console.error("Error creating planning stage:", error.message);
        res.status(500).json({ error: "Failed to create planning stage." });
    }
};


// get all the planning stages
export const getAllPlanningStages = async (req, res) => {
    const {
        page = 1,
        limit = 5,
        day,
        horaire,
        meet_link,
        startDate,
        endDate
    } = req.query; // Default to page 1 and 5 results per page
    const skip = (page - 1) * limit;
    try {
        // Build the filter object dynamically
        let filter = {};
        if (day) filter.day = new Date(day); // Filter by specific day
        if (horaire) filter.horaire = Number(horaire); // Filter by horaire
        if (meet_link) filter.meet_link = { $regex: meet_link, $options: 'i' }; // Case-insensitive match for meet_link

        // Range filters for day
        if (startDate || endDate) {
            filter.day = {};
            if (startDate) filter.day.$gte = new Date(startDate); // Day >= startDate
            if (endDate) filter.day.$lte = new Date(endDate); // Day <= endDate
        }

        // Fetch Planning Stages with the provided filters, pagination, and population
        const planningStages = await PlanningStage.find(filter)
            .populate({
                path: 'internship', // Populate internship field
                select: 'title topic student teacher', // Select specific fields from internship
                populate: [
                    {
                        path: 'student', // Populate student inside internship
                        select: 'firstName lastName', // Fetch these fields from student
                        populate: {
                            path: 'user', // Populate user to fetch email
                            select: 'email', // Select only email from user
                        },
                    },
                    {
                        path: 'teacher', // Populate teacher inside internship
                        select: 'firstName lastName', // Fetch these fields from teacher
                        populate: {
                            path: 'user', // Populate user to fetch email
                            select: 'email', // Select only email from user
                        },
                    },
                ],
            }) // Populate internship, student, and teacher details
            .skip(skip) // Skip results for previous pages
            .limit(Number(limit)); // Limit the results to the specified number
        // Fetch the total count of filtered Planning Stages
        const total = await PlanningStage.countDocuments(filter);

        res.status(200).json({
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            data: planningStages,
        });
    } catch (error) {
        console.error('Error fetching planning stages:', error.message);
        res.status(500).json({ error: 'Failed to fetch planning stages.' });
    }
};

// Fetch a single Planning Stage by ID
export const getPlanningStageById = async (req, res) => {
    const { id } = req.params;

    try {
        const planningStage = await PlanningStage.findById(id)
            .populate({
                path: 'internship', // Populate internship field
                select: 'title topic student teacher', // Select specific fields from internship
                populate: [
                    {
                        path: 'student', // Populate student inside internship
                        select: 'firstName lastName', // Fetch these fields from student
                        populate: {
                            path: 'user', // Populate user to fetch email
                            select: 'email', // Select only email from user
                        },
                    },
                    {
                        path: 'teacher', // Populate teacher inside internship
                        select: 'firstName lastName', // Fetch these fields from teacher
                        populate: {
                            path: 'user', // Populate user to fetch email
                            select: 'email', // Select only email from user
                        },
                    },
                ],
            }) // Populate internship, student, and teacher details
        if (!planningStage) {
            return res.status(404).json({ message: 'Planning Stage not found.' });
        }
        res.status(200).json(planningStage);
    } catch (error) {
        console.error('Error fetching planning stage:', error.message);
        res.status(500).json({ error: 'Failed to fetch planning stage.' });
    }
};

// Get planning for a student
export const getPlanningStageByStudent = async (req, res) => {
    try {
        const studentId = req.user.idRole; // Extract student ID from JWT token

        // Validate that the student ID is present
        if (!studentId) {
            return res.status(403).json({ message: "Unauthorized access. Only students can access this route." });
        }

        // Fetch planning stages for the student
        const planningStages = await PlanningStage.find({ isPublished: true })
            .populate({
                path: 'internship', // Populate internship field
                match: { student: studentId }, // Ensure the student matches
                select: 'title topic student teacher', // Select specific fields from internship
                populate: [
                    {
                        path: 'teacher', // Populate teacher inside internship
                        select: 'firstName lastName', // Fetch specific fields from teacher
                        populate: {
                            path: 'user', // Populate teacher's user details to get email
                            select: 'email', // Fetch only email from user
                        },
                    },
                ],
            });

        // Filter out planning stages without matched internships
        const filteredStages = planningStages.filter((stage) => stage.internship);

        // Check if no planning stages are found
        if (filteredStages.length === 0) {
            return res.status(404).json({ message: 'No planning stages found for this student.' });
        }

        // Respond with the fetched planning stages
        res.status(200).json({
            message: "Planning stages fetched successfully.",
            data: filteredStages,
        });
    } catch (error) {
        console.error('Error fetching planning stages:', error.message);

        // Return a descriptive error response
        res.status(500).json({
            message: 'An error occurred while fetching planning stages.',
            error: error.message,
        });
    }
};

// Update a Planning Stage
export const updatePlanningStage = async (req, res) => {
    const teacherId = req.user.idRole; // Extract teacher ID from JWT token
    const { id } = req.params;
    const { horaire, day, meet_link, internship } = req.body;

    try {
        // Fetch the planning stage and populate the internship's teacher details
        const planningStage = await PlanningStage.findById(id).populate({
            path: 'internship',
            populate: { path: 'teacher', select: '_id' },
        });

        if (!planningStage) {
            return res.status(404).json({ message: 'Planning Stage not found.' });
        }

        // Check if the logged-in teacher is authorized to update this planning stage
        if (planningStage.internship.teacher._id.toString() !== teacherId) {
            return res.status(403).json({ message: 'Not authorized to update this planning stage.' });
        }

        // Validate and update fields
        if (horaire) planningStage.horaire = horaire;
        if (day) planningStage.day = day;
        if (meet_link) planningStage.meet_link = meet_link;
        if (internship) planningStage.internship = internship;

        // Save the updated planning stage
        const updatedPlanningStage = await planningStage.save();

        // Respond with the updated planning stage
        res.status(200).json({
            message: 'Planning Stage updated successfully.',
            data: updatedPlanningStage,
        });
    } catch (error) {
        console.error('Error updating planning stage:', error.message);
        res.status(500).json({
            message: 'An error occurred while updating the planning stage.',
            error: error.message,
        });
    }
};


// Delete a Planning Stage
export const deletePlanningStage = async (req, res) => {
    const { id } = req.params;
    const { force } = req.body;

    try {
        // SOFT DELETE
        if (!force) {
            const planningStage = await PlanningStage.findById(id);
            planningStage.isArchived = true;
            await planningStage.save();
            return res.status(200).json({ message: 'Planning Stage archived successfully.' });
        }
        // HARD DELETE
        const deletedPlanningStage = await PlanningStage.findByIdAndDelete(id);
        if (!deletedPlanningStage) {
            return res.status(404).json({ message: 'Planning Stage not found.' });
        }
        res.status(200).json({ message: 'Planning Stage deleted successfully.' });
    } catch (error) {
        console.error('Error deleting planning stage:', error.message);
        res.status(500).json({ error: 'Failed to delete planning stage.' });
    }
};

// Update the isPublished status for all non-archived planning stages
export const updatePublicationStatus = async (req, res) => {
    const { response } = req.params; // Extract  'response' from the route parameters

    // Validate the `response` parameter
    if (response !== "true" && response !== "false") {
        return res.status(400).json({ message: "'response' parameter must be 'true' or 'false'." });
    }

    const isPublish = response === "true"; // Convert response to a boolean

    try {
        // Update all non-archived PlanningStage objects
        const result = await PlanningStage.updateMany(
            { isArchived: false }, // Condition: not archived
            { isPublished: isPublish } // Update: set isPublished to true/false based on the response
        );

        res.status(200).json({
            message: `Planning stages successfully ${isPublish ? "published" : "hidden"}.`,
            updatedCount: result.modifiedCount, // Number of documents updated
        });
    } catch (error) {
        console.error("Error updating planning stages:", error.message);
        res.status(500).json({ error: "Failed to update publication status." });
    }
};

// 
export const sendMailPlanning = async (req, res) => {
    try {
        // Fetch all published and non-archived planning stages
        const planningStages = await PlanningStage.find({ isPublished: true, isArchived: false })
            .populate({
                path: "internship",
                select: "student teacher topic",
                populate: [
                    {
                        path: "student",
                        select: "firstName lastName user",
                        populate: {
                            path: "user",
                            select: "email",
                        },
                    },
                    {
                        path: "teacher",
                        select: "firstName lastName user",
                        populate: {
                            path: "user",
                            select: "email",
                        },
                    },
                    {
                        path: "topic",
                        select: "title description techList",
                    },
                ],
            });

        if (planningStages.length === 0) {
            return res.status(404).json({ message: "Aucun planning trouvé à envoyer." });
        }

        const emailsToSend = [];

        // Build email content dynamically
        for (const stage of planningStages) {
            const { horaire, day, meet_link, sendStatus } = stage;
            const { internship } = stage;
            const { topic, student, teacher } = internship || {};

            const studentEmail = student?.user?.email;
            const teacherEmail = teacher?.user?.email;

            if (!topic) continue;

            // Determine email subject and message based on `sendStatus`
            const isFirstSend = sendStatus === "First Sent";
            const isModifiedSend = sendStatus === "Modified Sent";

            const emailSubject = isModifiedSend
                ? "Détails modifiés de votre planning de stage"
                : "Détails de votre planning de stage";

            // Prepare email message for teacher
            if (teacherEmail) {
                emailsToSend.push({
                    email: teacherEmail,
                    subject: emailSubject,
                    message: `
                        <p>Cher ${teacher.firstName} ${teacher.lastName},</p>
                        <p>Voici les ${isModifiedSend ? "détails modifiés" : "détails"
                        } du planning pour le stage :</p>
                        <ul>
                            <li><strong>Horaire :</strong> ${horaire}</li>
                            <li><strong>Jour :</strong> ${day}</li>
                            <li><strong>Meet Link :</strong> <a href="${meet_link}">${meet_link}</a></li>
                            <li><strong>Étudiant :</strong> ${student?.firstName} ${student?.lastName}</li>
                            <li><strong>Email étudiant :</strong> ${studentEmail || "Non disponible"}</li>
                            <li><strong>Sujet :</strong> ${topic.title}</li>
                            <li><strong>Description :</strong> ${topic.description}</li>
                            <li><strong>Technologies :</strong> ${topic.techList.join(", ")}</li>
                        </ul>
                    `,
                });
            }

            // Prepare email message for student
            if (studentEmail) {
                emailsToSend.push({
                    email: studentEmail,
                    subject: emailSubject,
                    message: `
                        <p>Cher ${student.firstName} ${student.lastName},</p>
                        <p>Voici les ${isModifiedSend ? "détails modifiés" : "détails"
                        } du planning pour le stage :</p>
                        <ul>
                            <li><strong>Horaire :</strong> ${horaire}</li>
                            <li><strong>Jour :</strong> ${day}</li>
                            <li><strong>Meet Link :</strong> <a href="${meet_link}">${meet_link}</a></li>
                            <li><strong>Enseignant :</strong> ${teacher?.firstName} ${teacher?.lastName}</li>
                            <li><strong>Email enseignant :</strong> ${teacherEmail || "Non disponible"}</li>
                            <li><strong>Sujet :</strong> ${topic.title}</li>
                            <li><strong>Description :</strong> ${topic.description}</li>
                            <li><strong>Technologies :</strong> ${topic.techList.join(", ")}</li>
                        </ul>
                    `,
                });
            }
        }

        if (emailsToSend.length === 0) {
            return res.status(400).json({ message: "Aucune adresse email trouvée à envoyer." });
        }

        // Send emails
        const emailPromises = emailsToSend.map(({ email, subject, message }) =>
            sendMail(email, subject, message)
        );
        await Promise.all(emailPromises);

        // Update the send status for all planning stages
        await PlanningStage.updateMany(
            { isPublished: true, isArchived: false },
            {
                sendStatus: "Modified Sent", // Set to "Modified Sent" after emails are successfully sent
            }
        );

        res.status(200).json({ message: "Emails envoyés avec succès." });
    } catch (error) {
        console.error("Error during email sending:", error.message);
        res.status(500).json({ message: "Échec de l'envoi des emails.", error: error.message });
    }
};
