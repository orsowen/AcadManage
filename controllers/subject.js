import Subject from "../models/Subject.js";
import User from "../models/User.js";
import Skill from "../models/Skill.js";
import nodemailer from "nodemailer";
import Teacher from "../models/Teachers.js";
import Student from "../models/Student.js";
import mongoose from "mongoose";

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
      const teacherUser = await Teacher.findById(teacher.teacherId);
      if (!teacherUser) {
        return res
          .status(404)
          .json({ error: `Le professeur avec l'ID ${teacher.teacherId} n'existe pas.` });
      }
    }

    // Valider les étudiants
    for (const student of students) {
      const studentUser = await Student.findById(student);
      if (!studentUser) {
        return res
          .status(404)
          .json({ error: `L'étudiant avec l'ID ${student} n'existe pas.` });
      }
    }

    // Validation des champs obligatoires
    if (
      !title ||
      !skills ||
      !level ||
      !semester ||
      !option ||
      !chargeHoraire ||
      !coeff ||
      !credit
    ) {
      return res.status(400).json({
        message:
          "Tous les champs obligatoires ne sont pas remplis ou invalides.",
      });
    }

    const skillsArray = Array.isArray(skills) ? skills : [skills];
    const validSkills = await Skill.find({ _id: { $in: skillsArray } });

    if (validSkills.length !== skillsArray.length) {
      return res
        .status(404)
        .json({ message: "Certaines compétences sont introuvables." });
    }

    const newSubject = new Subject({
      title,
      skills: validSkills.map((skill) => skill._id),
      level,
      semester,
      curriculum,
      teachers: teachers.map((teacher) => ({
        year: teacher.year, // Assurez-vous que `year` est une chaîne ou un nombre
        teacherId: teacher.teacherId, // Assurez-vous que `teacherId` est un ObjectId valide
      })),
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
    res
      .status(201)
      .json({ message: "Matière ajoutée avec succès.", data: savedSubject });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout de la matière.",
      error: error.message,
    });
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("skills", "name")
      .populate({
        path: "teachers.teacherId",
        select: "firstName lastName",
      })
      .populate("students", "firstName lastName");


    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des matières.", error: error.message });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    // Récupérer l'ID de la matière depuis les paramètres de la requête
    const subject = await Subject.findById(req.params.id).populate(
      "historique"
    );

    if (!subject) {
      return res.status(404).json({ message: "Matière introuvable." });
    }

    // Si la matière est trouvée, renvoyer les informations
    res.status(200).json({
      objectif: "Détail de la matière",
      data: subject,
    });
  } catch (error) {
    // Si une erreur survient pendant la récupération, renvoyer une erreur
    res.status(500).json({
      message: "Erreur lors de la récupération de la matière.",
      error: error.message,
    });
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

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de la matière invalide." });
    }

    // Trouver la matière à mettre à jour
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Matière introuvable." });
    }

    // Valider les enseignants
    if (teachers) {
      for (const teacher of teachers) {
        const teacherUser = await Teacher.findById(teacher.teacherId);
        if (!teacherUser) {
          return res.status(404).json({
            error: `Le professeur avec l'ID ${teacher.teacherId} n'existe pas.`,
          });
        }
      }
    }

    // Valider les étudiants
    if (students) {
      for (const student of students) {
        const studentUser = await Student.findById(student);
        if (!studentUser) {
          return res.status(404).json({
            error: `L'étudiant avec l'ID ${student} n'existe pas.`,
          });
        }
      }
    }

    // Valider les compétences
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      const validSkills = await Skill.find({ _id: { $in: skillsArray } });
      if (validSkills.length !== skillsArray.length) {
        return res.status(404).json({
          message: "Certaines compétences sont introuvables.",
        });
      }
      subject.skills = validSkills.map((skill) => skill._id);
    }

    // Mise à jour des champs principaux
    if (title) subject.title = title;
    if (level) subject.level = level;
    if (semester) subject.semester = semester;
    if (option) subject.option = option;
    if (chargeHoraire) subject.chargeHoraire = chargeHoraire;
    if (coeff) subject.coeff = coeff;
    if (credit) subject.credit = credit;
    if (published !== undefined) subject.published = published;

    // Mise à jour des enseignants
    if (teachers) {
      subject.teachers = teachers.map((teacher) => ({
        year: teacher.year,
        teacherId: teacher.teacherId,
      }));
    }

    // Mise à jour des étudiants
    if (students) subject.students = students;

    // Mise à jour du curriculum
    if (curriculum) {
      curriculum.forEach((newChapter, chapterIndex) => {
        const existingChapter = subject.curriculum[chapterIndex];

        if (existingChapter) {
          if (newChapter.chapter) existingChapter.chapter = newChapter.chapter;
          if (newChapter.sections) {
            newChapter.sections.forEach((newSection, sectionIndex) => {
              const existingSection = existingChapter.sections[sectionIndex];
              if (existingSection) {
                if (newSection.name) existingSection.name = newSection.name;
              } else {
                existingChapter.sections.push(newSection);
              }
            });
          }
        } else {
          subject.curriculum.push(newChapter);
        }
      });
    }

    // Ajouter une entrée dans l'historique
    const historiqueEntry = {
      date: new Date(),
      action: "Modification",
      utilisateur: req.user.id,
      details: "Mise à jour partielle de la matière.",
    };
    subject.historique.push(historiqueEntry);

    // Sauvegarder les modifications
    const updatedSubject = await subject.save();

    res.status(200).json({
      message: "Matière mise à jour avec succès.",
      data: updatedSubject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la matière.",
      error: error.message,
    });
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
      return res
        .status(400)
        .json({ message: "L'ID de la matière est requis." });
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
      return res.status(400).json({
        message:
          "Valeur de réponse invalide. Utilisez 'publish' ou 'unpublish'.",
      });
    }

    subject.historique.push({
      date: new Date(),
      action:
        response === "publish"
          ? "Publication de la matière"
          : "Masquage de la matière",
      utilisateur: req.user.id,
    });

    const updatedSubject = await subject.save();

    res.status(200).json({
      message: `Matière ${
        response === "publish" ? "publiée" : "masquée"
      } avec succès.`,
      data: updatedSubject,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Erreur lors de la modification de la publication de la matière.",
      error: error.message,
    });
  }
};

export const updateAvancement = async (req, res) => {
  const { id } = req.params;
  const { chapterName, sectionName, status, date } = req.body;

  if (!chapterName || !status || !date) {
    return res
      .status(400)
      .json({ error: "Les champs chapterName, status, et date sont requis." });
  }

  try {
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ error: "Matière non trouvée." });
    }

    const chapter = subject.curriculum.find(
      (chap) => chap.chapter === chapterName
    );
    if (!chapter) {
      return res.status(404).json({ error: "Chapitre non trouvé." });
    }

    if (sectionName) {
      const section = chapter.sections.find((sec) => sec.name === sectionName);
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
        console.log(
          `Tentative d'envoi d'email à l'administrateur ${admin.email}...`
        );
        await transporter.sendMail({
          from: { name: "acadManager", address: process.env.EMAIL_USER },
          to: admin.email, // Assurez-vous que l'admin a un champ 'email'
          subject: `Mise à jour de l'avancement de "${subject.title}"`,
          text: `L'état du chapitre "${chapterName}" a été mis à jour à "${status}".`,
        });
        console.log(`Email envoyé à l'administrateur ${admin.email}`);
      } catch (error) {
        console.error(
          "Erreur lors de l'envoi de l'email à l'administrateur :",
          error
        );
      }
    } else {
      console.log("Aucun administrateur trouvé.");
    }

    // // Envoi d'un email aux étudiants concernés
    // const students = await User.find({ role: "student"});
    // Envoi d'un email aux étudiants concernés
    const students = await User.find({ student: { $in: subject.students } });
    console.log(students);

    for (const student of students) {
      try {
        if (student.email) {
          console.log(
            `Tentative d'envoi d'email à l'étudiant ${student.email}...`
          );
          await transporter.sendMail({
            from: { name: "acadManager", address: process.env.EMAIL_USER },
            to: student.email,
            subject: `Mise à jour de l'avancement dans "${subject.title}"`,
            text: `L'état du chapitre "${chapterName}" a été mis à jour à "${status}".`,
          });
          console.log(`Email envoyé à l'étudiant ${student.email}`);
        } else {
          console.warn(`L'étudiant avec l'ID ${student._id} n'a pas d'email.`);
        }
      } catch (error) {
        console.error(
          `Erreur lors de l'envoi d'un email à ${student.email}:`,
          error
        );
      }
    }
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
      .populate("skills", "name") // Récupérer les compétences associées
      .populate({
        path: "teachers.teacherId",
        select: "firstName lastName",
      }) // Récupérer les infos de l'enseignant
      .populate("students", "firstName lastName"); // Récupérer les infos de l'étudiant

    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des matières.",
      error: error.message,
    });
  }
};

export const getAllSubjectsByStudent = async (req, res) => {
  const idStudent = req.user.idRole;

  console.log(idStudent);
  try {
    const subjects = await Subject.find({ students: { $in: idStudent } })
      .populate("skills", "name") // Récupérer les compétences associées
      .populate({
        path: "teachers.teacherId",
        select: "firstName lastName",
      }) // Récupérer les infos de l'enseignant
      .populate("students", "firstName lastName"); // Récupérer les infos de l'étudiant

    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des matières.",
      error: error.message,
    });
  }
};

export const assignStudentToSubject = async (req, res) => {
  const { subjectId, studentId } = req.body;
  console.log(subjectId, studentId);

  if (!subjectId || !studentId) {
    return res
      .status(400)
      .json({ message: "ID de matière et ID d'étudiant sont requis." });
  }

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Matière introuvable." });
    }
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Etudiant introuvable." });
    }
    // Vérifier si l'étudiant n'est pas déjà affecté à la matière
    if (subject.students.includes(studentId)) {
      return res
        .status(400)
        .json({ message: "L'étudiant est déjà affecté à la matière." });
    }
    subject.students.push(studentId);

    subject.historique.push({
      date: new Date(),
      action: "Affectation de l'étudiant",
      utilisateur: req.user.id,
    });

    await subject.save();
    res.status(200).json({
      message: "Etudiant affecté à la matière",
      subject: subject.title,
      student: student.firstName + "" + student.lastName,
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
      return res
        .status(400)
        .json({ message: "La raison du changement est obligatoire." });
    }

    // Ajouter la proposition au champ `historique`
    const historiqueEntry = {
      date: new Date(),
      action: "Proposition de modification",
      utilisateur: userId,
      raison: raison,
      proposition: curriculum,
      validée: false, // En attente de validation
    };

    subject.historique.push(historiqueEntry);

    await subject.save();

    res.status(200).json({
      message:
        "Proposition de modification ajoutée à l’historique en attente de validation.",
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la proposition de modification.",
      error: error.message,
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
      .find(
        (entry) =>
          entry.validée === false &&
          entry.action === "Proposition de modification"
      );

    if (!lastProposition) {
      return res
        .status(404)
        .json({ message: "Aucune proposition en attente de validation." });
    }

    // Ajouter l'ancien curriculum à l'historique
    const ancienCurriculum = JSON.parse(JSON.stringify(subject.curriculum)); // Cloner l'ancien curriculum
    subject.historique.push({
      date: new Date(),
      action: "Validation de modification",
      utilisateur: req.user.id,
      ancienCurriculum: ancienCurriculum,
      raison: "Validation des modifications proposées",
      validée: true,
    });

    // Appliquer les modifications proposées au curriculum
    subject.curriculum = lastProposition.proposition;
    lastProposition.validée = true; // Marquer la proposition comme validée

    await subject.save();

    res.status(200).json({
      message: "Proposition validée et curriculum mis à jour.",
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la validation de la proposition.",
      error: error.message,
    });
  }
};

export const notifyStudentsForEvaluation = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    // Vérifier si la matière existe
    if (!subject) {
      return res.status(404).json({ message: "Matière introuvable." });
    }

    // Récupération des étudiants inscrits à la matière
    const students = await User.find({ student: { $in: subject.students } });
    console.log(students);

    if (students.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun étudiant inscrit pour cette matière." });
    }

    // Configuration du transporteur d'e-mails (Nodemailer)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Envoi des notifications par e-mail
    for (const student of students) {
      try {
        await transporter.sendMail({
          from: { name: "acadManager", address: process.env.EMAIL_USER },
          to: student.email,
          subject: `Évaluation de la matière "${subject.title}"`,
          text: `Bonjour, Cher Etudiant, Veuillez remplir le formulaire d'évaluation pour votre matière : ${subject.title}.         Merci pour votre participation.`,
        });
        console.log(`Notification envoyée à ${student.email}`);
      } catch (error) {
        console.error(`Échec d'envoi à ${student.email}: ${error.message}`);
      }
    }

    res
      .status(200)
      .json({ message: "Les notifications ont été envoyées avec succès." });
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({
      message: "Erreur lors de l'envoi des notifications.",
      error: error.message,
    });
  }
};

export const AllSubjectnotifyStudentsForEvaluation = async (req, res) => {
  try {
    const subjects = await Subject.find({});
    if (subjects.length === 0) {
      return res.status(404).json({ message: "Aucune matière disponible." });
    }

    const results = [];

    for (const subject of subjects) {
      // Récupération des étudiants inscrits à la matière
      const students = await User.find({ student: { $in: subject.students } });
      console.log(students);

      if (students.length === 0) {
        results.push({
          subject: subject.title,
          message: "Aucun étudiant inscrit pour cette matière.",
        });
        continue;
      }

      // Configuration du transporteur d'e-mails (Nodemailer)
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Envoi des notifications par e-mail
      for (const student of students) {
        try {
          await transporter.sendMail({
            from: { name: "acadManager", address: process.env.EMAIL_USER },
            to: student.email,
            subject: `Évaluation de la matière "${subject.title}"`,
            text: `Bonjour, Cher Etudiant, Veuillez remplir le formulaire d'évaluation pour votre matière : ${subject.title}.         Merci pour votre participation.`,
          });
          results.push({
            subject: subject.title,
            student: student.email,
            message: "Notification envoyée avec succès.",
          });
        } catch (error) {
          results.push({
            subject: subject.title,
            student: student.email,
            message: `Échec d'envoi : ${error.message}`,
          });
        }
      }
    }
    res.status(200).json({
      message: "Les notifications ont été envoyées avec succès.",
      results,
    });
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({
      message: "Erreur lors de l'envoi des notifications.",
      error: error.message,
    });
  }
};

export const submitEvaluation = async (req, res) => {
  try {
    const { id } = req.params; // ID de la matière
    const { feedback, rating } = req.body; // Contenu de l'évaluation
    const userId = req.user.id;

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ message: "Matière introuvable." });
    }

    // Vérifier si l'utilisateur a déjà évalué la matière
    const alreadyEvaluated = subject.evaluations.some(
      (evaluation) => evaluation.userId === userId
    );

    if (alreadyEvaluated) {
      return res
        .status(400)
        .json({ message: "Vous avez déjà évalué cette matière." });
    }

    // Ajouter une évaluation anonyme
    subject.evaluations.push({
      feedback,
      rating,
      userId, // Utilisé uniquement pour vérification et supprimé après sauvegarde
    });

    await subject.save();

    // Supprimer l'identité après la sauvegarde pour garantir l'anonymat
    subject.evaluations = subject.evaluations.map((evaluation) => {
      const { userId, ...rest } = evaluation.toObject();
      return rest;
    });
    await subject.save();

    res.status(201).json({ message: "Évaluation enregistrée avec succès." });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout de l'évaluation.",
      error: error.message,
    });
  }
};

export const getEvaluations = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    console.log(
      `Matière ID: ${id}, Utilisateur ID: ${userId}, Rôle: ${userRole}`
    );

    // Vérifier si la matière existe
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Matière introuvable." });
    }

    // Vérification pour les enseignants
    if (userRole === "teacher") {
      // Récupérer l'enseignant associé à l'utilisateur
      const teacher = await Teacher.findOne({ user: userId });
      if (!teacher) {
        return res
          .status(403)
          .json({ message: "Vous ne pouvez voir que vos matières." });
      }

      const isTeacherOfSubject = subject.teachers.includes(
        teacher._id.toString()
      );
      if (!isTeacherOfSubject) {
        return res
          .status(403)
          .json({ message: "Vous ne pouvez voir que vos matières." });
      }
    }

    // Renvoyer les évaluations de la matière
    res.status(200).json({ evaluations: subject.evaluations });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des évaluations.",
      error: error.message,
    });
  }
};
