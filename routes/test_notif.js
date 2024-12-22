import express from 'express';
import nodemailer from 'nodemailer';
import Teacher from '../models/Teachers.js';  

import dotenv from 'dotenv';

dotenv.config(); // Charger les variables d'environnement depuis .env

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // Récupérer la liste des enseignants uniquement (avec le rôle 'teacher')
        console.log("Fetching teachers...");

        const teachers = await Teacher.find().populate('user', 'email');

        console.log(`Found ${teachers.length} teachers`);

        // Configuration du transporteur pour l'envoi des emails
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Envoi des emails à chaque enseignant
        for (let teacher of teachers) {
            console.log(`Sending email to ${teacher.user.email}...`);
            let mailOptions = {
                from: {name: "acadManager",
                    address: process.env.EMAIL_USER},
                to: teacher.user.email,
                subject: 'Mise à jour de l\'avancement',
                text: 'Bonjour, nous vous rappelons de mettre à jour l\'avancement de vos matières ce mois-ci.',
            };

            // Envoi de l'email
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${teacher.user.email}`);
            } catch (emailError) {
                console.error(`Failed to send email to ${teacher.user.email}: ${emailError.message}`);
            }
        }

        // Réponse de succès
        res.status(200).json({ message: 'Notifications envoyées aux enseignants.' });
    } catch (error) {
        // Gestion des erreurs
        console.error('Error during sending notifications:', error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi des notifications' });
    }
});

export default router; // Exportation du router pour l'utiliser dans d'autres fichiers
