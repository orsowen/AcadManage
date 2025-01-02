import DefensePFE from '../models/DefensePFE';
import PFE from '../models/PFE'; // Import the PFE model
import Teacher from '../models/Teacher'; // Import the Teacher model
import { sendMail } from './mailer';

// Function to check for overlaps
const checkForOverlap = async (salle, date, heure, enseignantId, type) => {
    // Check if the room is already booked at the same date and time
    const overlapSalle = await DefensePFE.findOne({
        Salle: salle,
        Date: date,
        Heure: heure,
    });

    if (overlapSalle) {
        throw new Error('The room is already booked for this date and time.');
    }

    // Check if the teacher is already assigned to a defense at the same time
    const overlapEnseignant = await DefensePFE.findOne({
        Enseignant: enseignantId,
        Date: date,
        Heure: heure,
        Type: type, // Check the type of the teacher (encadrant, rapporteur, président)
    });

    if (overlapEnseignant) {
        throw new Error(`The teacher is already assigned as a ${type} at this date and time.`);
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
            // Update the teacher's role in the existing `DefensePFE`
            if (type === "president") {
                defensePFE.PresidentJury = enseignantId;
            } else if (type === "rapporteur") {
                defensePFE.Rapporteur = enseignantId;
            }

            // Update general fields
            defensePFE.Salle = salle;
            defensePFE.Date = date;
            defensePFE.Heure = heure;
        } else {
            // Create a new `DefensePFE`
            defensePFE = new DefensePFE({
                PFE: id,
                Salle: salle,
                Date: date,
                Heure: heure,
                Publisher: false,
                PresidentJury: type === "president" ? enseignantId : undefined,
                Rapporteur: type === "rapporteur" ? enseignantId : undefined,
                Encadrent: pfe.teacher?._id, // Automatically assign the PFE's teacher as Encadrent
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
        console.error("Error in DefensePFE:", error);
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

        // Update the Publisher field for all DefensePFE documents
        await DefensePFE.updateMany({}, { Publisher: publisherStatus });

        res.status(200).json({ message: `All defense schedules have been ${response === 'publish' ? 'published' : 'hidden'} successfully.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// Function to send email and update emailStatus for all DefensePFE sessions
export const sendDefensePlanningEmail = async (req, res) => {
    try {
        // Find all DefensePFE sessions where emailStatus is 'none' or 'first' (not yet sent or first sent)
        const defensePFEs = await DefensePFE.find({ emailStatus: { $in: ['none', 'first'] } })
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
                select: 'user firstName lastName email'
            })
            .populate({
                path: 'Rapporteur',
                select: 'user firstName lastName email'
            })
            .populate({
                path: 'Encadrent',
                select: 'user firstName lastName email'
            });

        if (!defensePFEs.length) {
            return res.status(404).json({ message: 'No DefensePFE sessions to send emails to.' });
        }

        // Loop through each DefensePFE and send the email to both student and teacher
        for (let defensePFE of defensePFEs) {
            if (!defensePFE.PFE.student || !defensePFE.PFE.student.user || !defensePFE.PFE.student.user.email) {
                console.warn(`No email found for student with ID ${defensePFE.PFE.student}`);
                continue;
            }

            // Check if the teachers have emails
            const teachers = [defensePFE.PresidentJury, defensePFE.Rapporteur, defensePFE.Encadrent];
            for (let teacher of teachers) {
                if (teacher && (!teacher.user || !teacher.user.email)) {
                    console.warn(`No email found for teacher with ID ${teacher}`);
                    continue;
                }
            }

            let subject = '';
            let status = defensePFE.emailStatus;
            if (status === 'none') {
                subject = 'Your Defense Planning Link';
                status = 'first';
            } else if (status === 'first') {
                subject = 'Your Defense Planning Link Modified';
                status = 'second';
            } else {
                continue; // Skip sending email if already sent twice
            }

            const studentEmailContent = `
                <p>Dear ${defensePFE.PFE.student.firstName} ${defensePFE.PFE.student.lastName},</p>
                <p>Your Defense session details:</p>
                <ul>
                    <li>Title: ${defensePFE.PFE.title}</li>
                    <li>Supervisor: ${defensePFE.PFE.teacher ? `${defensePFE.PFE.teacher.firstName} ${defensePFE.PFE.teacher.lastName}` : '<strong>No supervisor assigned</strong>'}</li>
                    <li>Date: ${defensePFE.Date.toDateString()}</li>
                    <li>Time: ${defensePFE.Heure}</li>
                    <li>Room: ${defensePFE.Salle}</li>
                </ul>
                ${status === 'none' ? '<p>This is your first email with planning details. Please confirm the information.</p>' : '<p>This is an updated version of your planning details.</p>'}
                <p>Best regards,<br>Admin Team</p>
            `;

            const teacherEmailContent = `
                <p>Dear ${defensePFE.PresidentJury.firstName} ${defensePFE.PresidentJury.lastName},</p>
                <p>As part of the PFE defense session, you have been assigned the role of President of Jury. The details are as follows:</p>
                <ul>
                    <li>Student: ${defensePFE.PFE.student.firstName} ${defensePFE.PFE.student.lastName}</li>
                    <li>Title: ${defensePFE.PFE.title}</li>
                    <li>Room: ${defensePFE.Salle}</li>
                    <li>Date: ${defensePFE.Date.toDateString()}</li>
                    <li>Time: ${defensePFE.Heure}</li>
                </ul>
                ${status === 'none' ? '<p>This is your first email with planning details. Please confirm the information.</p>' : '<p>This is an updated version of your planning details.</p>'}
                <p>Best regards,<br>Admin Team</p>
            `;

            // Send email to the student
            await sendMail(defensePFE.PFE.student.user.email, subject, studentEmailContent);

            // Send email to the teachers
            if (defensePFE.PresidentJury?.user.email) {
                await sendMail(defensePFE.PresidentJury.user.email, subject, teacherEmailContent);
            }
            if (defensePFE.Rapporteur?.user.email) {
                await sendMail(defensePFE.Rapporteur.user.email, subject, teacherEmailContent);
            }
            if (defensePFE.Encadrent?.user.email) {
                await sendMail(defensePFE.Encadrent.user.email, subject, teacherEmailContent);
            }

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
