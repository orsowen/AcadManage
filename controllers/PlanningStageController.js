import Internship from '../models/Internship.js';
import PlanningStage from '../models/PlanningStage.js';
import { sendMail } from './mailer.js';

export const sendPlanningNotification = async (internshipDoc, planningDetails, isUpdate = false, sendTo = "student") => {
    const studentEmail = internshipDoc.student?.user?.email;
    const studentName = `${internshipDoc.student?.firstName} ${internshipDoc.student?.lastName}`;
    const teacherName = `${internshipDoc.teacher?.firstName} ${internshipDoc.teacher?.lastName}`;
    const teacherEmail = internshipDoc.teacher?.user?.email;
    const topicTitle = internshipDoc.topic?.title || "Non spécifié";
    const topicDescription = internshipDoc.topic?.description || "Non spécifié";
    const techList = internshipDoc.topic?.techList?.join(", ") || "Non spécifiées";

    const { horaire, day, meet_link } = planningDetails;

    const subjectPrefix = isUpdate
        ? "Mise à jour des détails de votre planning de stage"
        : "Détails de votre planning de stage";

    const emailTemplates = {
        student: {
            recipientEmail: studentEmail,
            recipientName: studentName,
            subject: `${subjectPrefix} - Étudiant`,
            message: `
                <p>Bonjour ${studentName},</p>
                <p>${isUpdate ? "Les détails de votre planning ont été mis à jour :" : "Voici les détails de votre planning :"}</p>
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
            `,
        },
        teacher: {
            recipientEmail: teacherEmail,
            recipientName: teacherName,
            subject: `${subjectPrefix} - Enseignant`,
            message: `
                <p>Bonjour ${teacherName},</p>
                <p>${isUpdate ? "Les détails du planning de stage ont été mis à jour :" : "Voici les détails du planning de stage :"}</p>
                <ul>
                    <li><strong>Horaire :</strong> ${horaire}</li>
                    <li><strong>Jour :</strong> ${day}</li>
                    <li><strong>Lien de réunion :</strong> <a href="${meet_link}">${meet_link}</a></li>
                    <li><strong>Étudiant :</strong> ${studentName}</li>
                    <li><strong>Email étudiant :</strong> ${studentEmail || "Non disponible"}</li>
                    <li><strong>Sujet :</strong> ${topicTitle}</li>
                    <li><strong>Description :</strong> ${topicDescription}</li>
                    <li><strong>Technologies :</strong> ${techList}</li>
                </ul>
                <p>Cordialement,</p>
                <p>L'équipe de gestion de stages</p>
            `,
        },
    };

    if (sendTo === "student" && studentEmail) {
        const { recipientEmail, subject, message } = emailTemplates.student;
        await sendMail(recipientEmail, subject, message);
    } else if (sendTo === "teacher" && teacherEmail) {
        const { recipientEmail, subject, message } = emailTemplates.teacher;
        await sendMail(recipientEmail, subject, message);
    } else if (sendTo === "both") {
        const emailPromises = [];
        if (studentEmail) {
            const { recipientEmail, subject, message } = emailTemplates.student;
            emailPromises.push(sendMail(recipientEmail, subject, message));
        }
        if (teacherEmail) {
            const { recipientEmail, subject, message } = emailTemplates.teacher;
            emailPromises.push(sendMail(recipientEmail, subject, message));
        }
        await Promise.all(emailPromises);
    }
};

// Create a new Planning Stage
export const createPlanningStage = async (req, res) => {
    const { idRole: teacherId, role } = req.user; // Extract teacher ID and role from JWT token
    const { horaire, day, meet_link, internship, shouldSendMail = false } = req.body;

    try {
        // Fetch the internship and populate necessary details
        const internshipDoc = await Internship.findById(internship).populate([
            {
                path: "student",
                select: "firstName lastName user",
                populate: { path: "user", select: "email" },
            },
            {
                path: "teacher",
                select: "firstName lastName user",
                populate: { path: "user", select: "email" },
            },
        ]);

        if (!internshipDoc) {
            return res.status(404).json({ error: "Internship not found." });
        }

        // Check if a planning stage already exists
        if (await PlanningStage.exists({ internship })) {
            return res.status(400).json({ error: "Planning for this internship already exists." });
        }

        // Authorization check
        if (!internshipDoc.teacher || (teacherId !== internshipDoc.teacher._id.toString() && role !== "admin")) {
            return res.status(403).json({
                error: internshipDoc.teacher ? "Unauthorized to plan this stage." : "No teacher assigned to the internship.",
            });
        }

        // Prepare and save the new planning stage
        const newPlanningStage = new PlanningStage({ horaire, day, meet_link, internship, sendStatus: "Not Sent" });
        const savedPlanningStage = await newPlanningStage.save();

        // Update the internship with the planning stage reference
        internshipDoc.planning = savedPlanningStage._id;
        await internshipDoc.save();

        // Send notification email if needed
        if (shouldSendMail && internshipDoc.student?.user?.email) {
            const planningDetails = { horaire, day, meet_link };
            await sendPlanningNotification(internshipDoc, planningDetails, false);
            savedPlanningStage.sendStatus = "First Sent"; // Update status after sending email
            await savedPlanningStage.save();
        }

        // Respond with success and the created planning stage
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
        endDate,
    } = req.query;

    // Validate and parse pagination parameters
    const currentPage = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const currentLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;

    // Dynamically build the filter object
    const filter = {};

    // Apply filters based on query parameters
    if (day) {
        const parsedDay = new Date(day);
        if (isNaN(parsedDay)) {
            return res.status(400).json({ error: "Invalid day format. Use YYYY-MM-DD." });
        }
        filter.day = parsedDay;
    }

    if (horaire) {
        const parsedHoraire = Number(horaire);
        if (isNaN(parsedHoraire)) {
            return res.status(400).json({ error: "Invalid horaire format. It must be a number." });
        }
        filter.horaire = parsedHoraire;
    }

    if (meet_link) {
        filter.meet_link = { $regex: meet_link, $options: "i" }; // Case-insensitive match
    }

    // Range filters for day
    if (startDate || endDate) {
        filter.day = {};
        if (startDate) {
            const parsedStartDate = new Date(startDate);
            if (isNaN(parsedStartDate)) {
                return res.status(400).json({ error: "Invalid startDate format. Use YYYY-MM-DD." });
            }
            filter.day.$gte = parsedStartDate;
        }
        if (endDate) {
            const parsedEndDate = new Date(endDate);
            if (isNaN(parsedEndDate)) {
                return res.status(400).json({ error: "Invalid endDate format. Use YYYY-MM-DD." });
            }
            filter.day.$lte = parsedEndDate;
        }
    }

    try {
        // Fetch Planning Stages with filters, pagination, and population
        const planningStages = await PlanningStage.find(filter)
            .populate({
                path: "internship",
                select: "title topic student teacher",
                populate: [
                    {
                        path: "student",
                        select: "firstName lastName",
                        populate: {
                            path: "user",
                            select: "email",
                        },
                    },
                    {
                        path: "teacher",
                        select: "firstName lastName",
                        populate: {
                            path: "user",
                            select: "email",
                        },
                    },
                ],
            })
            .skip((currentPage - 1) * currentLimit)
            .limit(currentLimit);

        // Fetch total count of filtered Planning Stages
        const total = await PlanningStage.countDocuments(filter);

        if (planningStages.length === 0) {
            return res.status(404).json({ message: "No planning stages found with the given filters." });
        }

        res.status(200).json({
            total,
            page: currentPage,
            limit: currentLimit,
            totalPages: Math.ceil(total / currentLimit),
            data: planningStages,
        });
    } catch (error) {
        console.error("Error fetching planning stages:", error.message);
        res.status(500).json({
            error: "An unexpected error occurred while fetching planning stages.",
            details: error.message,
        });
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
        res.status(200).json({
            message: "planning Stage fetched successfully.",
            data: planningStage,
        });
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
    const { idRole: teacherId, role } = req.user; // Extract teacher ID and role from JWT token
    const { id } = req.params;
    // const { horaire, day, meet_link, internship, shouldSendMail = false } = req.body;
    const { horaire, day, meet_link, shouldSendMail = false } = req.body;

    try {
        // Fetch the planning stage and populate necessary details
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


        if (!planningStage) return res.status(404).json({ message: "Planning Stage not found." });

        // Authorization check: Only the assigned teacher or admin can update the planning stage
        const isAuthorized = role === "admin" || planningStage.internship.teacher?._id.toString() === teacherId;
        if (!isAuthorized) {
            return res.status(403).json({ message: "Not authorized to update this planning stage." });
        }

        // Update fields if provided
        Object.assign(planningStage, {
            ...(horaire && { horaire }),
            ...(day && { day }),
            ...(meet_link && { meet_link }),
        });

        // Handle optional email notification
        if (shouldSendMail && planningStage.internship?.student?.user?.email) {
            const planningDetails = { horaire, day, meet_link };
            if (role === "admin")
                await sendPlanningNotification(planningStage.internship, planningDetails, true, "both");
            else
                await sendPlanningNotification(planningStage.internship, planningDetails, true, "student");

            // Update sendStatus
            planningStage.sendStatus = "Modified Sent";
            console.log("Notification email sent to:", planningStage.internship.student.user.email);
        }

        // Save the updated planning stage, including sendStatus
        const updatedPlanningStage = await planningStage.save();

        res.status(200).json({
            message: `Planning Stage updated successfully${shouldSendMail ? " and notification sent." : "."}`,
            data: updatedPlanningStage,
        });
    } catch (error) {
        console.error("Error updating planning stage:", error.message);
        res.status(500).json({
            message: "An error occurred while updating the planning stage.",
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
            { isArchived: false, isPublished: !isPublish }, // Condition: not archived
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

// Send mail to teachers and students to inform them of planning
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
                        populate: { path: "user", select: "email" },
                    },
                    {
                        path: "teacher",
                        select: "firstName lastName user",
                        populate: { path: "user", select: "email" },
                    },
                ],
            });

        if (!planningStages.length) {
            return res.status(404).json({ message: "Aucun planning trouvé à envoyer." });
        }

        // Extract IDs of planning stages
        const planningStageIds = planningStages.map(stage => stage._id);

        // Prepare emails to send
        const emailsToSend = planningStages.flatMap(stage => {
            const { horaire, day, meet_link, sendStatus, internship } = stage;
            if (!internship) return [];

            const { topic, student, teacher } = internship;
            const studentEmail = student?.user?.email;
            const teacherEmail = teacher?.user?.email;

            // Ensure required fields are present
            if (!topic || !studentEmail || !teacherEmail) return [];

            const isModifiedSend = sendStatus === "Modified Sent";
            const emailSubject = isModifiedSend
                ? "Détails modifiés de votre planning de stage"
                : "Détails de votre planning de stage";

            const emailBody = (recipient, isTeacher) => `
                <p>Bonjour ${recipient.firstName} ${recipient.lastName},</p>
                <p>Voici les ${isModifiedSend ? "détails modifiés" : "détails"} du planning pour le stage :</p>
                <ul>
                    <li><strong>Horaire :</strong> ${horaire}</li>
                    <li><strong>Jour :</strong> ${day}</li>
                    <li><strong>Meet Link :</strong> <a href="${meet_link}">${meet_link}</a></li>
                    ${isTeacher
                    ? `<li><strong>Étudiant :</strong> ${student.firstName} ${student.lastName}</li>
                    <li><strong>Email étudiant :</strong> ${studentEmail || "Non disponible"}</li>`
                    : `<li><strong>Enseignant :</strong> ${teacher.firstName} ${teacher.lastName}</li>
                    <li><strong>Email enseignant :</strong> ${teacherEmail || "Non disponible"}</li>`}
                    <li><strong>Sujet :</strong> ${topic.title}</li>
                    <li><strong>Description :</strong> ${topic.description}</li>
                    <li><strong>Technologies :</strong> ${topic.techList.join(", ")}</li>
                </ul>
            `;

            return [
                {
                    email: teacherEmail,
                    subject: emailSubject,
                    message: emailBody(teacher, true),
                },
                {
                    email: studentEmail,
                    subject: emailSubject,
                    message: emailBody(student, false),
                },
            ];
        });

        if (!emailsToSend.length) {
            return res.status(400).json({ message: "Aucune adresse email trouvée à envoyer." });
        }

        // Send emails using sendMail utility
        await Promise.all(
            emailsToSend.map(({ email, subject, message }) =>
                sendMail(email, subject, message).catch(err =>
                    console.error(`Failed to send email to ${email}:`, err.message)
                )
            )
        );

        // Update sendStatus only for the fetched planning stages
        await PlanningStage.updateMany(
            { _id: { $in: planningStageIds } },
            { sendStatus: "Modified Sent" }
        );

        res.status(200).json({ message: "Emails envoyés avec succès." });
    } catch (error) {
        console.error("Error during email sending:", error.message);
        res.status(500).json({ message: "Échec de l'envoi des emails.", error: error.message });
    }
};
