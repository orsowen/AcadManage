import Subject from '../models/Subject.js';
import Skill from '../models/Skill.js';


export const addSubject = async (req, res) => {
    try {
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
        } = req.body;

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

