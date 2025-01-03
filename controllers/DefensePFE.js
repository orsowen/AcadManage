import DefensePFE from '../models/DefensePFE.js';
import PFE from '../models/PFE.js'; // Import the PFE model
import Teacher from '../models/Teachers.js'; // Import the Teacher model
import { sendMail } from './mailer.js';

// Function to check for overlaps
const checkForOverlap = async (salle, date, heure, enseignantId, id) => {
    // Check if the room is already booked at the same date and time, excluding the current defense
    const overlapSalle = await DefensePFE.findOne({
        _id: { $ne: id }, // Exclude the current defense by ID
        Salle: salle,
        Date: date,
        Heure: heure,
    });
    if (overlapSalle) {
        throw new Error('The room is already booked for this date and time.');
    }

    // Check if the teacher is already assigned to a defense at the same date and time, excluding the current defense
    const overlapEnseignant = await DefensePFE.findOne({
        _id: { $ne: id }, // Exclude the current defense by ID
        $or: [
            { PresidentJury: enseignantId },
            { Rapporteur: enseignantId },
            { Encadrent: enseignantId },
        ],
        Date: date,
        Heure: heure,
    });

    if (overlapEnseignant) {
        throw new Error(`The teacher is already assigned at this date and time.`);
    }
};


// Controller to assign or update a teacher's role in a DefensePFE
export const CreateOrUpdateDefensePFE = async (req, res) => {
    try {
        const { id } = req.params; // PFE ID
        const { enseignantId, salle, date, heure, type } = req.body;

        // Validate `heure` format (HH:mm)
        const heureRegex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
        if (!heureRegex.test(heure)) {
            return res.status(400).json({ message: "Invalid time format. Use HH:mm." });
        }

        // Check if the PFE exists
        const pfe = await PFE.findById(id).populate('teacher'); // Populate `teacher` for auto-assigning Encadrent
        if (!pfe) {
            return res.status(404).json({ message: "PFE not found." });
        }
        if (pfe.isArchived == true) {
            return res.status(404).json({ message: "PFE is not availble for this year." });
        }
        // Check if the teacher exists (if `enseignantId` is provided)
        if (enseignantId) {
            const enseignant = await Teacher.findById(enseignantId);
            if (!enseignant) {
                return res.status(404).json({ message: "Teacher not found." });
            }
        }
        // Find or create the `DefensePFE` for this PFE
        let defensePFE = await DefensePFE.findOne({ PFE: id });

        if (defensePFE) {
            if (defensePFE.isArchived) {
                return res.status(400).json({
                    message: "This Pfe  is for previous years",
                });
            }
            checkForOverlap(salle, date, heure, enseignantId, defensePFE._id);
            if (
                (defensePFE.PresidentJury && defensePFE.PresidentJury.toString() === enseignantId) ||
                (defensePFE.Rapporteur && defensePFE.Rapporteur.toString() === enseignantId) ||
                (defensePFE.Encadrent && defensePFE.Encadrent.toString() === enseignantId)
            ) {
                return res.status(400).json({
                    message: "This teacher is already assigned to a different role for this defense.",
                });
            }
            // Update the teacher's role in the existing `DefensePFE`
            if (type === "President") {
                defensePFE.PresidentJury = enseignantId;
            } else if (type === "Rapporteur") {
                defensePFE.Rapporteur = enseignantId;
            } else if (type === "Encadrent") {
                defensePFE.Encadrent = enseignantId;
            } else {
                return res.status(400).json({
                    message: `Error: Invalid role type '${type}'`,
                });
            }
            // Update general fields
            defensePFE.Salle = salle;
            defensePFE.Date = date;
            defensePFE.Heure = heure;
        } else {
            checkForOverlap(salle, date, heure, enseignantId);

            // Create a new `DefensePFE`
            defensePFE = new DefensePFE({
                PFE: id,
                Salle: salle,
                Date: date,
                Heure: heure,
                Publisher: false,
                isArchived: false,
                PresidentJury: type === "president" ? enseignantId : undefined,
                Rapporteur: type === "rapporteur" ? enseignantId : undefined,
                Encadrent: pfe.teacher?._id,
            });
        }

        // Save the DefensePFE document
        await defensePFE.save();

        // Update the `Defense` reference in the `PFE` document
        pfe.Defense = defensePFE._id;
        await pfe.save();

        res.status(200).json({
            message: `Teacher assigned as ${type} successfully.`,
            defensePFE,
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred.", error: error.message });
    }
};



// Controller to publish or hide all defense schedules
export const publishOrHideDefense = async (req, res) => {
    try {
        const { response } = req.params;  // response will be either 'publish' or 'hide'
        // Validate the response value
        if (response !== 'publish' && response !== 'hide') {
            return res.status(400).json({ message: 'Invalid response. Expected "publish" or "hide".' });
        }

        // Set the Publisher flag based on the response
        const publisherStatus = response === 'publish' ? true : false;
        let defensePFE = await DefensePFE.find({ isArchived: false });
        console.log(defensePFE)
        if (defensePFE.length == 0) {
            return res.status(400).json({ message: 'there is no Defense PFE Created this Year' });
        }
        // Update the Publisher field for all DefensePFE documents
        await DefensePFE.updateMany({ isArchived: false }, { Publisher: publisherStatus });

        res.status(200).json({ message: `All defense schedules have been ${response === 'publish' ? 'published' : 'hidden'} successfully.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// Function to send email and update emailStatus for all DefensePFE sessions
export const sendDefensePlanningEmail = async (req, res) => {
    try {
        // Find all DefensePFE sessions where emailStatus is 'none' or 'first' (not yet sent or first sent)
        const defensePFEs = await DefensePFE.find({ isArchived: false })
            .populate({
                path: 'PFE',
                populate: {
                    path: 'student',
                    populate: {
                        path: 'user',
                        select: 'email firstName lastName'
                    }
                }
            })
            .populate({
                path: 'PresidentJury',
                populate: {
                    path: 'user',
                    select: 'email firstName lastName'
                }
            })
            .populate({
                path: 'Rapporteur',
                populate: {
                    path: 'user',
                    select: 'email firstName lastName'
                }
            })
            .populate({
                path: 'Encadrent',
                populate: {
                    path: 'user',
                    select: 'email firstName lastName'
                }
            });

        if (!defensePFEs.length) {
            return res.status(404).json({ message: 'No Defense PFE sessions to send emails to.' });
        }

        // Loop through each DefensePFE and send the email to both student and teacher
        for (let defensePFE of defensePFEs) {
            if (!defensePFE.PFE.student || !defensePFE.PFE.student.user || !defensePFE.PFE.student.user.email) {
                console.warn(`No email found for student with ID ${defensePFE.PFE.student}`);
                continue;
            }

            // Check if the teachers have emails
            const teachers = [
                { role: 'President of Jury', person: defensePFE.PresidentJury },
                { role: 'Rapporteur', person: defensePFE.Rapporteur },
                { role: 'Encadrent', person: defensePFE.Encadrent }
            ];

            let subject = '';
            let status = defensePFE.emailStatus;
            if (status === 'none') {
                subject = 'Your Defense Planning Link';
                status = 'first';
            } else if (status === 'first') {
                subject = 'Your Defense Planning Link Modified';
                status = 'second';
            } else {
                subject = 'Your Defense Planning Link Modified';
            }

            const studentEmailContent = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0; }
            .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background-color:rgb(32, 30, 129); color: white; text-align: center; padding: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header img {
                float: left;
                height: 50px;
                margin-right: 15px;
            }
            .content { padding: 20px; }
            .content p { margin: 0 0 15px; line-height: 1.6; color: #555; }
            .content ul { padding-left: 20px; margin: 15px 0; }
            .content ul li { margin-bottom: 10px; color: #333; }
            .cta-button { display: inline-block; background-color:rgb(102, 90, 228); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { background-color: #f2f2f2; color: #777; text-align: center; padding: 10px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <img src="https://isa2m.rnu.tn/assets/img/logo-dark.png" alt="Logo">
                <h1>Defense Session Details</h1>
            </div>
            <div class="content">
                <p>Dear <strong>${defensePFE.PFE.student.firstName} ${defensePFE.PFE.student.lastName}</strong>,</p>
                <p>Your Defense session details are as follows:</p>
                <ul>
                    <li><strong>Title:</strong> ${defensePFE.PFE.title}</li>
                    <li><strong>Supervisor:</strong> ${defensePFE.PFE.teacher ? `${defensePFE.PFE.teacher.firstName} ${defensePFE.PFE.teacher.lastName}` : '<strong>No supervisor assigned</strong>'}</li>
                    <li><strong>Date:</strong> ${defensePFE.Date.toDateString()}</li>
                    <li><strong>Time:</strong> ${defensePFE.Heure}</li>
                    <li><strong>Room:</strong> ${defensePFE.Salle}</li>
                </ul>
                <p>${status === 'none' ? 'This is your first email with planning details. Please confirm the information.' : 'This is an updated version of your planning details.'}</p>
                <p>Best regards,<br>Isamm</p>
                <a href="#" class="cta-button">Confirm Details</a>
            </div>
            <div class="footer">
                <p>© 2025 Isamm. All Rights Reserved.</p>
            </div>
        </div>
    </body>
    </html>
`;

            // Send email to the teachers
            for (let teacher of teachers) {
                if (teacher.person && teacher.person.user && teacher.person.user.email) {
                    const teacherEmailContent = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0; }
                .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .header { background-color:rgb(32, 30, 129); color: white; text-align: center; padding: 20px; }
                .header h1 { margin: 0; font-size: 24px; }
                .header img {
                    float: left;
                    height: 50px;
                    margin-right: 15px;
                }
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
                    <h1>Jury Role Assignment</h1>
                </div>
                <div class="content">
                    <p>Dear <strong>${teacher.person.user.firstName} ${teacher.person.user.lastName}</strong>,</p>
                    <p>As part of the PFE defense session, you have been assigned the role of <strong style="color: darkblue;">${teacher.role}</strong>. The details are as follows:</p>
                    <ul>
                        <li><strong>Student:</strong> ${defensePFE.PFE.student.firstName} ${defensePFE.PFE.student.lastName}</li>
                        <li><strong>Title:</strong> ${defensePFE.PFE.title}</li>
                        <li><strong>Room:</strong> ${defensePFE.Salle}</li>
                        <li><strong>Date:</strong> ${defensePFE.Date.toDateString()}</li>
                        <li><strong>Time:</strong> ${defensePFE.Heure}</li>
                    </ul>
                    <p>${status === 'none' ? 'This is your first email with planning details. Please confirm the information.' : 'This is an updated version of your planning details.'}</p>
                    <p>Best regards,<br>Isamm</p>
                </div>
                <div class="footer">
                    <p>© 2025 Isamm. All Rights Reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

                    await sendMail(teacher.person.user.email, subject, teacherEmailContent);
                }
            }

            // Send email to the student
            await sendMail(defensePFE.PFE.student.user.email, subject, studentEmailContent);

            // Update the DefensePFE document with the new email status
            defensePFE.emailStatus = status;
            await defensePFE.save();
        }

        return res.status(200).json({
            message: `${defensePFEs.length} emails sent successfully.`,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error sending emails.' });
    }
};

