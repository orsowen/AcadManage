import Subject from '../models/Subject.js';
import Skill from '../models/Skill.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';


export const addSubject = async (req, res) => {
    try {
        const {
            title,
            skills,
            level,
            semester,
            curriculum,
            teacher,
            students,
            published,
            option,
            chargeHoraire,
            coeff,
            credit,
        } = req.body;

        // Valider le rôle du teacher
        const teacherUser = await User.findById(teacher); // Vérifier si l'utilisateur est un enseignant
        if (!teacherUser || teacherUser.role !== "teacher") {
            return res.status(400).json({ error: "L'utilisateur sélectionné pour 'teacher' n'est pas valide." });
        }

        // Valider le rôle du student
        const studentUser = await User.findById(students); // Vérifier si l'utilisateur est un étudiant
        if (!studentUser || studentUser.role !== "student") {
            return res.status(400).json({ error: "L'utilisateur sélectionné pour 'student' n'est pas valide." });
        }

        // Validation des champs obligatoires
        if (!title || !skills || !level || !semester || !option || !chargeHoraire || !coeff || !credit) {
            return res.status(400).json({ message: "Tous les champs obligatoires ne sont pas remplis ou invalides." });
        }

        // Convertir en tableau si une seule compétence est fournie
        const skillsArray = Array.isArray(skills) ? skills : [skills];

        // Vérifier si toutes les compétences existent dans la base de données
        const validSkills = await Skill.find({ _id: { $in: skillsArray } });

        // Si le nombre de compétences trouvées ne correspond pas à celui envoyé, cela signifie que certaines sont invalides
        if (validSkills.length !== skillsArray.length) {
            return res.status(404).json({ message: "Certaines compétences sont introuvables." });
        }

        // Créer et sauvegarder la matière
        const newSubject = new Subject({
            title,
            skills: validSkills.map(skill => skill._id), // Utiliser les _id des compétences valides
            level,
            semester,
            curriculum,
            teacher,
            students,
            published,
            option,
            chargeHoraire,
            coeff,
            credit,
        });

        const savedSubject = await newSubject.save();
        res.status(201).json({ message: "Matière ajoutée avec succès.", data: savedSubject });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout de la matière.", error: error.message });
    }
};

export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find()
            .populate('skills', 'name') // Récupérer les compétences associées
            //.populate('teacher', 'name email'); // Récupérer les infos de l'enseignant
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des matières.', error: error.message });
    }
};

export const getSubjectById = async (req, res) => {
    try {
        // Récupérer l'ID de la matière depuis les paramètres de la requête
        const subject = await Subject.findById(req.params.id)
        
        if (!subject) {
            return res.status(404).json({ message: "Matière introuvable." });
        }

        // Si la matière est trouvée, renvoyer les informations
        res.status(200).json({ message: "Matière trouvée.", data: subject });
    } catch (error) {
        // Si une erreur survient pendant la récupération, renvoyer une erreur
        res.status(500).json({ message: "Erreur lors de la récupération de la matière.", error: error.message });
    }
};

export const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;  // Récupérer l'ID de la matière depuis les paramètres de la requête
        const {
            title,
            skills,
            level,
            semester,
            curriculum,
            teacher,
            published,
            option,
            chargeHoraire,
            coeff,
            credit,
        } = req.body;  // Récupérer les informations envoyées dans le body de la requête

        // Vérifier si l'ID est valide
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de la matière invalide." });
        }

        // Trouver la matière par ID
        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({ message: "Matière introuvable." });
        }

        // Mettre à jour la matière avec les nouvelles informations
        subject.title = title || subject.title;
        subject.skills = skills || subject.skills;
        subject.level = level || subject.level;
        subject.semester = semester || subject.semester;
        subject.curriculum = curriculum || subject.curriculum;
        subject.teacher = teacher || subject.teacher;
        subject.published = published !== undefined ? published : subject.published;
        subject.option = option || subject.option;
        subject.chargeHoraire = chargeHoraire || subject.chargeHoraire;
        subject.coeff = coeff || subject.coeff;
        subject.credit = credit || subject.credit;

        // Sauvegarder les modifications dans la base de données
        const updatedSubject = await subject.save();

        // Répondre avec la matière mise à jour
        res.status(200).json({ message: "Matière mise à jour avec succès.", data: updatedSubject });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la matière.", error: error.message });
    }
};

export const toggleSubjectPublish = async (req, res) => {
    try {
        const { response } = req.params; 
        const { subjectId } = req.body;

        if (!subjectId) {
            return res.status(400).json({ message: "L'ID de la matière est requis." });
        }

        // Vérifiez si la matière existe.
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Matière introuvable." });
        }

        // Mettre à jour le statut de publication.
        if (response === "publish") {
            subject.published = true;
        } else if (response === "unpublish") {
            subject.published = false;
        } else {
            return res.status(400).json({ message: "Valeur de réponse invalide. Utilisez 'publish' ou 'unpublish'." });
        }

        const updatedSubject = await subject.save();

        res.status(200).json({
            message: `Matière ${response === "publish" ? "publiée" : "masquée"} avec succès.`,
            data: updatedSubject,
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la modification de la publication de la matière.", error: error.message });
    }
};

export const updateAvancement = async (req, res) => {
    const { id } = req.params;
    const { chapterName, sectionName, status, date } = req.body;

    if (!chapterName || !status || !date) {
        return res.status(400).json({ error: "Les champs chapterName, status, et date sont requis." });
    }

    try {
        const subject = await Subject.findById(id).populate("teacher");
        if (!subject) {
            return res.status(404).json({ error: "Matière non trouvée." });
        }

        const chapter = subject.curriculum.find(chap => chap.chapter === chapterName);
        if (!chapter) {
            return res.status(404).json({ error: "Chapitre non trouvé." });
        }

        if (sectionName) {
            const section = chapter.sections.find(sec => sec.name === sectionName);
            if (!section) {
                return res.status(404).json({ error: "Section non trouvée." });
            }

            section.status = status;
            section.completedAt = date;
        } else {
            chapter.status = status;
            chapter.completedAt = date;
        }

        await subject.save();

        // Test de l'envoi de l'email à l'administrateur
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const admin = await User.findOne({ role: "admin" });
        if (admin) {
            try {
                console.log(`Tentative d'envoi d'email à l'administrateur ${admin.email}...`);
                await transporter.sendMail({
                    from: { name: "acadManager", address: process.env.EMAIL_USER },
                    to: admin.email, // Assurez-vous que l'admin a un champ 'email'
                    subject: `Mise à jour de l'avancement de "${subject.title}"`,
                    text: `L'état du chapitre "${chapterName}" a été mis à jour à "${status}".`,
                });
                console.log(`Email envoyé à l'administrateur ${admin.email}`);
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'email à l'administrateur :", error);
            }
        } else {
            console.log("Aucun administrateur trouvé.");
        }

        // Test de l'envoi de l'email aux étudiants
        for (const studentId of subject.students) {
            try {
                const student = await User.find({student : studentId});
                
                if (!student) {
                    console.log(`Étudiant avec ID ${studentId} non trouvé.`);
                    continue;
                }

                console.log(`Tentative d'envoi d'email à l'étudiant ${student.email}...`);

                if (student.email) {  // Vérifiez le champ 'email' au lieu de 'email'
                    await transporter.sendMail({
                        from: { 
                            name: "acadManager", 
                            address: process.env.EMAIL_USER },
                        to: student.email, // Utilisez l'email de l'étudiant
                        subject: `Mise à jour de "${subject.title}"`,
                        text: `Le chapitre "${chapterName}" a été mis à jour à "${status}".`,
                    });
                    console.log(`Email envoyé à ${student.email}.`);
                } else {
                    console.log(`Adresse email invalide ou absente pour l'étudiant ${studentId}.`);
                }
            } catch (error) {
                console.error(`Erreur lors de l'envoi de l'email à l'étudiant ${studentId} :`, error);
            }
        }

        res.status(200).json({ message: "Avancement mis à jour et notifications envoyées." });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'avancement :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
};



