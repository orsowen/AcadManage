import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Teacher from './models/User.js';

// Tâche cron pour envoyer la notification chaque mois
cron.schedule('0 0 1 * *', async () => {
    try {
        // Trouver tous les enseignants dans la base de données
        const teachers = await Teacher.find({ role: 'teacher' });

        // Configurer le transporteur de mails (utilisez votre propre méthode)
        let transporter = nodemailer.createTransport({
            service: 'gmail', // ou autre service de votre choix
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        // Pour chaque enseignant, envoyer un email
        teachers.forEach(async (teacher) => {
            // Définir le contenu de l'email
            let mailOptions = {
                from: process.env.EMAIL_USER,
                to: teacher.email, // Email de l'enseignant
                subject: 'Mise à jour de l\'avancement',
                text: 'Bonjour, nous vous rappelons de mettre à jour l\'avancement de vos matières ce mois-ci.'
            };

            // Envoyer l'email
            await transporter.sendMail(mailOptions);
        });

        console.log('Notifications envoyées aux enseignants.');
    } catch (error) {
        console.error('Erreur lors de l\'envoi des notifications:', error);
    }
}, {
    scheduled: true,
    timezone: 'Africa/Tunis' // Assurez-vous d'utiliser le bon fuseau horaire
});
