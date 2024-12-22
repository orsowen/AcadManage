import Subject_PFA from "../models/Subject_PFA.js";
import Teacher from "../models/Teachers.js";
import SoutenancePFA from "../models/SoutenancePFA.js"; // Modèle Soutenance
import dotenv from "dotenv";

dotenv.config();

//8.1
export const generateSoutenances = async (req, res) => {
  try {
    const { days, rooms } = req.body; // Liste des jours et salles disponibles

    if (!days || !rooms || days.length === 0 || rooms.length === 0) {
      return res.status(400).json({
        message: "Veuillez fournir des jours et des salles disponibles.",
      });
    }

    const subjects = await Subject_PFA.find({ status: "Approved" })
      .populate("teacher", "firstName lastName")
      .exec();

    if (subjects.length === 0) {
      return res.status(404).json({ message: "Aucun sujet approuvé trouvé." });
    }

    const teachers = await Teacher.find().exec();

    let soutenances = [];
    let currentDayIndex = 0;
    let currentRoomIndex = 0;
    let currentHour = 9; // Début à 9h00

    for (const subject of subjects) {
      // Déterminer la date et la salle
      const date = days[currentDayIndex];
      const room = rooms[currentRoomIndex];

      // Ajouter une soutenance
      const startTime = `${currentHour}:00`;
      const endTime = `${currentHour + 0.5}:00`;

      // Trouver un rapporteur différent de l'encadrant
      const rapporteur = teachers.find(
        (teacher) => teacher._id.toString() !== subject.teacher._id.toString()
      );

      if (!rapporteur) {
        return res
          .status(500)
          .json({ message: "Impossible de trouver un rapporteur." });
      }

      soutenances.push({
        subject: subject._id,
        date,
        startTime,
        endTime,
        room,
        teacher: subject.teacher._id,
        rapporteur: rapporteur._id,
      });

      // Mettre à jour les indices pour jour, salle et heure
      currentHour += 0.5; // Ajouter 30 minutes
      if (currentHour >= 15) {
        // Fin de journée à 15h
        currentHour = 9; // Revenir à 9h le jour suivant
        currentRoomIndex = (currentRoomIndex + 1) % rooms.length; // Changer de salle
        currentDayIndex = (currentDayIndex + 1) % days.length; // Passer au jour suivant
      }
    }

    // Sauvegarder les soutenances
    await SoutenancePFA.insertMany(soutenances);

    res
      .status(201)
      .json({ message: "Soutenances générées avec succès.", soutenances });
  } catch (error) {
    console.error("Erreur lors de la génération des soutenances :", error);
    res.status(500).json({ message: error.message });
  }
};

//8.2 By teacher
export const getPlanningByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Récupérer les soutenances où l'enseignant est encadrant ou rapporteur
    const planning = await SoutenancePFA.find({
      $or: [{ teacher: teacherId }, { rapporteur: teacherId }],
    })
      .populate("subject", "title student") // Charger les informations du sujet et de l'étudiant
      .exec();

    if (planning.length === 0) {
      return res.status(404).json({ message: "Aucune soutenance trouvée." });
    }

    res.status(200).json({ planning });
  } catch (error) {
    console.error("Erreur lors de la récupération du planning :", error);
    res.status(500).json({ message: error.message });
  }
};

export const getPlanningByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log("Student ID:", studentId);

    // 1. Chercher tous les sujets où l'étudiant est impliqué comme monome ou binome
    const subjects = await Subject_PFA.find({
      $or: [
        { monome: studentId }, // Si l'étudiant est le monome
        { binome: studentId }, // Si l'étudiant est le binome
      ],
    }).exec();

    console.log("Sujets trouvés:", subjects);

    if (!subjects || subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun sujet trouvé pour cet étudiant." });
    }

    // 2. Chercher toutes les soutenances qui correspondent aux sujets trouvés
    const subjectIds = subjects.map((subject) => subject._id);

    const planning = await SoutenancePFA.find({
      subject: { $in: subjectIds }, // Chercher les soutenances liées aux sujets trouvés
    })
      .populate("subject", "title teacher monome binome") // Charger les infos du sujet
      .exec();

    console.log("Planning trouvé:", planning);

    if (!planning || planning.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucune soutenance trouvée pour cet étudiant." });
    }

    res.status(200).json({ planning });
  } catch (error) {
    console.error("Erreur lors de la récupération du planning :", error);
    res.status(500).json({ message: error.message });
  }
};
