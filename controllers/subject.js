import Subject from '../models/Subject.js';
import User from '../models/User.js'
import Skill from '../models/Skill.js';
import nodemailer from 'nodemailer';
import Teacher from '../models/Teachers.js';
import Student from '../models/Student.js';
import mongoose from 'mongoose';

export const addSubject = async (req, res) => {
    try {
        const {
            title,
            skills,
            level,
            semester,
            curriculum,
            teachers,
            students,
            published,
            option,
            chargeHoraire,
            coeff,
            credit,
        } = req.body;

        // Valider les enseignants
        for (const teacher of teachers) {
            const teacherUser = await Teacher.findById(teacher);
            if (!teacherUser) {
                return res.status(404).json({ error: `Le professeur avec l'ID ${teacher} n'existe pas.` });
            }
        }

        // Valider les étudiants
        for (const student of students) {
            const studentUser = await Student.findById(student);
            if (!studentUser) {
                return res.status(404).json({ error: `L'étudiant avec l'ID ${student} n'existe pas.` });
            }
        }

        // Validation des champs obligatoires
        if (!title || !skills || !level || !semester || !option || !chargeHoraire || !coeff || !credit) {
            return res.status(400).json({ message: "Tous les champs obligatoires ne sont pas remplis ou invalides." });
        }

        const skillsArray = Array.isArray(skills) ? skills : [skills];
        const validSkills = await Skill.find({ _id: { $in: skillsArray } });

        if (validSkills.length !== skillsArray.length) {
            return res.status(404).json({ message: "Certaines compétences sont introuvables." });
        }

        const newSubject = new Subject({
            title,
            skills: validSkills.map(skill => skill._id),
            level,
            semester,
            curriculum,
            teachers,
            students,
            published,
            option,
            chargeHoraire,
            coeff,
            credit,
            historique: [
                {
                    date: new Date(),
                    action: "Ajout",
                    utilisateur: req.user.id,
                },
            ],
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
            .populate('skills', 'name')
            .populate('teachers', 'firstName lastName')
            .populate('students', 'firstName lastName')
        
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des matières.', error: error.message });
    }
};

export const getSubjectById = async (req, res) => {
    try {
        // Récupérer l'ID de la matière depuis les paramètres de la requête
        const subject = await Subject.findById(req.params.id).populate('historique');

        if (!subject) {
            return res.status(404).json({ message: "Matière introuvable." });
        }

        // Si la matière est trouvée, renvoyer les informations
        res.status(200).json({
            objectif: "Détail de la matière",
            data: subject
        });

    } catch (error) {
        // Si une erreur survient pendant la récupération, renvoyer une erreur
        res.status(500).json({ message: "Erreur lors de la récupération de la matière.", error: error.message });
    }
};

export const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            skills,
            level,
            semester,
            curriculum,
            teachers,
            students,
            published,
            option,
            chargeHoraire,
            coeff,
            credit,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de la matière invalide." });
        }

        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({ message: "Matière introuvable." });
        }

        // Valider enseignants et étudiants
        for (const teacher of teachers) {
            const teacherUser = await Teacher.findById(teacher);
            if (teacher && !teacherUser) {
                return res.status(404).json({ error: `Le professeur avec l'ID ${teacher} n'existe pas.` });
            }
        }

        for (const student of students) {
            const studentUser = await Student.findById(student);
            if (student && !studentUser) {
                return res.status(404).json({ error: `L'étudiant avec l'ID ${student} n'existe pas.` });
            }
        }

        // Filtrer les nouveaux enseignants et étudiants
        const newTeachers = teachers ? teachers.filter(teacher => !subject.teachers.includes(teacher)) : [];
        const newStudents = students ? students.filter(student => !subject.students.includes(student)) : [];

        // Préparer un tableau pour les modifications
        const modifications = [];

        // Vérification des champs principaux et mise à jour partielle
        if (title && title !== subject.title) {
            modifications.push({ field: "title", oldValue: subject.title, newValue: title });
            subject.title = title;
        }
        if (skills && !arraysEqual(skills, subject.skills)) {
            modifications.push({ field: "skills", oldValue: subject.skills, newValue: skills });
            subject.skills = skills;
        }
        if (level && level !== subject.level) {
            modifications.push({ field: "level", oldValue: subject.level, newValue: level });
            subject.level = level;
        }
        if (semester && semester !== subject.semester) {
            modifications.push({ field: "semester", oldValue: subject.semester, newValue: semester });
            subject.semester = semester;
        }

        // Gestion du curriculum : mise à jour partielle
        if (curriculum) {
            curriculum.forEach((newChapter, chapterIndex) => {
                const existingChapter = subject.curriculum[chapterIndex];

                if (existingChapter) {
                    if (newChapter.chapter && newChapter.chapter !== existingChapter.chapter) {
                        modifications.push({ field: `curriculum[${chapterIndex}].chapter`, oldValue: existingChapter.chapter, newValue: newChapter.chapter });
                        existingChapter.chapter = newChapter.chapter;
                    }

                    if (newChapter.sections) {
                        newChapter.sections.forEach((newSection, sectionIndex) => {
                            const existingSection = existingChapter.sections[sectionIndex];

                            if (existingSection) {
                                if (newSection.name && newSection.name !== existingSection.name) {
                                    modifications.push({ field: `curriculum[${chapterIndex}].sections[${sectionIndex}].name`, oldValue: existingSection.name, newValue: newSection.name });
                                    existingSection.name = newSection.name;
                                }
                            } else {
                                existingChapter.sections.push(newSection);
                                modifications.push({ field: `curriculum[${chapterIndex}].sections[${sectionIndex}]`, newValue: newSection });
                            }
                        });
                    }
                } else {
                    subject.curriculum.push(newChapter);
                    modifications.push({ field: `curriculum[${chapterIndex}]`, newValue: newChapter });
                }
            });
        }

        // Mise à jour des enseignants et étudiants si nécessaire
        if (teachers && !arraysEqual(teachers, subject.teachers)) {
            modifications.push({ field: "teachers", oldValue: subject.teachers, newValue: teachers });
            subject.teachers = teachers;
        }
        if (students && !arraysEqual(students, subject.students)) {
            modifications.push({ field: "students", oldValue: subject.students, newValue: students });
            subject.students = students;
        }
        if (published !== undefined && published !== subject.published) {
            modifications.push({ field: "published", oldValue: subject.published, newValue: published });
            subject.published = published;
        }
        if (option && option !== subject.option) {
            modifications.push({ field: "option", oldValue: subject.option, newValue: option });
            subject.option = option;
        }
        if (chargeHoraire && chargeHoraire !== subject.chargeHoraire) {
            modifications.push({ field: "chargeHoraire", oldValue: subject.chargeHoraire, newValue: chargeHoraire });
            subject.chargeHoraire = chargeHoraire;
        }
        if (coeff && coeff !== subject.coeff) {
            modifications.push({ field: "coeff", oldValue: subject.coeff, newValue: coeff });
            subject.coeff = coeff;
        }
        if (credit && credit !== subject.credit) {
            modifications.push({ field: "credit", oldValue: subject.credit, newValue: credit });
            subject.credit = credit;
        }

        // Si des modifications existent, les ajouter à l'historique
        if (modifications.length > 0) {
            const historiqueEntry = {
                date: new Date(),
                action: "Modification partielle",
                utilisateur: req.user.id,
                details: modifications,
            };
            subject.historique.push(historiqueEntry);
        }

        // Sauvegarder les nouvelles informations dans la base de données
        const updatedSubject = await subject.save();

        res.status(200).json({ message: "Matière mise à jour partiellement avec succès.", data: updatedSubject });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour partielle de la matière.", error: error.message });
    }
};

// Fonction pour comparer les tableaux (par exemple les skills et les enseignants)
const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (!b.includes(a[i])) return false;
    }
    return true;
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

        subject.historique.push({
            date: new Date(),
            action: response === "publish" ? "Publication de la matière" : "Masquage de la matière",
            utilisateur: req.user.id,
        });

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
        const subject = await Subject.findById(id);
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

        subject.historique.push({
            date: new Date(),
            action: "Mise à jour de l'avancement",
            utilisateur: req.user.id,
        });

        await subject.save();

        res.status(200).json({
            message: "Avancement mis à jour avec succès.",
        });
    } catch (error) {
        res.status(500).json({
            error: "Erreur lors de la mise à jour de l'avancement.",
            details: error.message,
        });
    }
};

export const getAllSubjectsByTeacher = async (req, res) => {
    const idTeacher = req.user.idRole;

    console.log(idTeacher);
    try {

        const subjects = await Subject.find({ teachers: { $in: idTeacher } })
            .populate('skills', 'name') // Récupérer les compétences associées
            .populate('teachers', 'firstName lastName') // Récupérer les infos de l'enseignant
            .populate('students', 'firstName lastName') // Récupérer les infos de l'étudiant

        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des matières.', error: error.message });
    }
};

export const getAllSubjectsByStudent = async (req, res) => {
    const idStudent = req.user.idRole;

    console.log(idStudent);
    try {

        const subjects = await Subject.find({ students: { $in: idStudent } })
            .populate('skills', 'name') // Récupérer les compétences associées
            .populate('teachers', 'firstName lastName') // Récupérer les infos de l'enseignant
            .populate('students', 'firstName lastName') // Récupérer les infos de l'étudiant

        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des matières.', error: error.message });
    }
};

export const assignStudentToSubject = async (req, res) => {
    const { subjectId, studentId } = req.body;
    console.log(subjectId, studentId);

    if (!subjectId || !studentId) {
        return res.status(400).json({ message: 'ID de matière et ID d\'étudiant sont requis.' });
    }

    try {
        const subject = await
            Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Matière introuvable.' });
        }
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Etudiant introuvable.' });
        }
        // Vérifier si l'étudiant n'est pas déjà affecté à la matière
        if (subject.students.includes(studentId)) {
            return res.status(400).json({ message: 'L\'étudiant est déjà affecté à la matière.' });
        }
        subject.students.push(studentId);

        subject.historique.push({
            date: new Date(),
            action: "Affectation de l'étudiant",
            utilisateur: req.user.id,
        });

        await subject.save();
        res.status(200).json({
            message: 'Etudiant affecté à la matière',
            subject: subject.title,
            student: student.firstName + '' + student.lastName,
        });

    } catch (error) {
        console.error("Erreur lors de l'affectation de l'étudiant :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

export const proposeModification = async (req, res) => {
    try {
        const { id } = req.params;
        const { curriculum, raison } = req.body; 
        const userId = req.user.id; 

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de la matière invalide." });
        }

        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({ message: "Matière introuvable." });
        }

        if (!raison || raison.trim() === "") {
            return res.status(400).json({ message: "La raison du changement est obligatoire." });
        }

        // Ajouter la proposition au champ `historique`
        const historiqueEntry = {
            date: new Date(),
            action: "Proposition de modification",
            utilisateur: userId,
            raison: raison,
            proposition: curriculum,
            validée: false // En attente de validation
        };

        subject.historique.push(historiqueEntry);

        await subject.save();

        res.status(200).json({
            message: "Proposition de modification ajoutée à l’historique en attente de validation.",
            data: subject
        });
    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la proposition de modification.",
            error: error.message
        });
    }
};

export const validateModification = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de la matière invalide." });
        }

        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({ message: "Matière introuvable." });
        }

        // Trouver la dernière proposition non validée
        const lastProposition = subject.historique
            .slice()
            .reverse()
            .find((entry) => entry.validée === false && entry.action === "Proposition de modification");

        if (!lastProposition) {
            return res.status(404).json({ message: "Aucune proposition en attente de validation." });
        }

        // Ajouter l'ancien curriculum à l'historique
        const ancienCurriculum = JSON.parse(JSON.stringify(subject.curriculum)); // Cloner l'ancien curriculum
        subject.historique.push({
            date: new Date(),
            action: "Validation de modification",
            utilisateur: req.user.id,
            ancienCurriculum: ancienCurriculum,
            raison: "Validation des modifications proposées",
            validée: true
        });

        // Appliquer les modifications proposées au curriculum
        subject.curriculum = lastProposition.proposition;
        lastProposition.validée = true; // Marquer la proposition comme validée

        await subject.save();

        res.status(200).json({
            message: "Proposition validée et curriculum mis à jour.",
            data: subject
        });
    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la validation de la proposition.",
            error: error.message
        });
    }
};

