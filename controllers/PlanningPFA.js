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

//8.2 by student
export const getPlanningByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log("Student ID:", studentId);

    // Chercher tous les sujets où l'étudiant est impliqué comme monome ou binome
    const subjects = await Subject_PFA.find({
      $or: [{ monome: studentId }, { binome: studentId }],
    }).exec();

    console.log("Sujets trouvés:", subjects);

    if (!subjects || subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun sujet trouvé pour cet étudiant." });
    }

    // Extraire les IDs des sujets trouvés
    const subjectIds = subjects.map((subject) => subject._id);

    // Chercher toutes les soutenances qui correspondent aux sujets trouvés
    const planning = await SoutenancePFA.find({
      subject: { $in: subjectIds }, // Chercher les soutenances liées aux sujets trouvés
    })
      .populate({
        path: "subject",
        select: "title teacher monome binome",
        populate: [
          { path: "monome", select: "firstName lastName" },
          { path: "binome", select: "firstName lastName" },
        ],
      })
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

//8.3 update soutenances
export const updateSoutenance = async (req, res) => {
  try {
    const { id } = req.params; // ID de la soutenance à modifier
    const { teacher, rapporteur, room, date, startTime } = req.body;

    console.log(`Modification de la soutenance ${id}`);

    // Vérifier si la soutenance existe
    const soutenance = await SoutenancePFA.findById(id);
    if (!soutenance) {
      return res
        .status(404)
        .json({ message: "La soutenance demandée n'existe pas." });
    }

    // Calculer automatiquement endTime (durée fixe de 30 minutes)
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const endTime = `${startHours}:${(startMinutes + 30) % 60}`; // Ajout de 30 minutes
    console.log(`Calculated endTime: ${endTime}`);

    // Vérification des chevauchements horaires pour la salle
    const overlapRoom = await SoutenancePFA.findOne({
      _id: { $ne: id }, // Ignorer la soutenance actuelle
      room: room,
      date: date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Début chevauche la fin
      ],
    });

    if (overlapRoom) {
      return res
        .status(400)
        .json({ message: "La salle est déjà réservée à cet horaire." });
    }

    // Vérification des chevauchements horaires pour l'enseignant
    const overlapTeacher = await SoutenancePFA.findOne({
      _id: { $ne: id }, // Ignorer la soutenance actuelle
      teacher: teacher,
      date: date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Début chevauche la fin
      ],
    });

    if (overlapTeacher) {
      return res.status(400).json({
        message:
          "L'enseignant est déjà assigné à une autre soutenance à cet horaire.",
      });
    }

    // Vérification des chevauchements horaires pour le rapporteur
    const overlapRapporteur = await SoutenancePFA.findOne({
      _id: { $ne: id }, // Ignorer la soutenance actuelle
      rapporteur: rapporteur,
      date: date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Début chevauche la fin
      ],
    });

    if (overlapRapporteur) {
      return res.status(400).json({
        message:
          "Le rapporteur est déjà assigné à une autre soutenance à cet horaire.",
      });
    }

    // Mise à jour des champs
    soutenance.teacher = teacher || soutenance.teacher;
    soutenance.rapporteur = rapporteur || soutenance.rapporteur;
    soutenance.room = room || soutenance.room;
    soutenance.date = date || soutenance.date;
    soutenance.startTime = startTime || soutenance.startTime;
    soutenance.endTime = endTime || soutenance.endTime;

    // Sauvegarder la soutenance modifiée
    const updatedSoutenance = await soutenance.save();

    res.status(200).json({
      message: "Soutenance mise à jour avec succès.",
      soutenance: updatedSoutenance,
    });
  } catch (error) {
    console.error("Erreur lors de la modification de la soutenance :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
