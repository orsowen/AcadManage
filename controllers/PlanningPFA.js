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

    // Récupérer les sujets approuvés avec leurs encadrants
    const subjects = await Subject_PFA.find({ status: "Approved" })
      .populate("teacher", "firstName lastName")
      .exec();

    if (subjects.length === 0) {
      return res.status(404).json({ message: "Aucun sujet approuvé trouvé." });
    }

    let soutenances = [];
    let currentDayIndex = 0;
    let currentRoomIndex = 0;
    let currentHour = 9; // Heure de début
    let currentMinute = 0; // Minute de début

    // Création d'une file circulaire des enseignants qui seront rapporteurs
    const teacherQueue = subjects.map((subject) => subject.teacher);

    for (const subject of subjects) {
      // Déterminer la date et la salle
      const date = days[currentDayIndex];
      const room = rooms[currentRoomIndex];

      // Formater l'heure de début
      const startTime = `${String(currentHour).padStart(2, "0")}:${String(
        currentMinute
      ).padStart(2, "0")}`;

      // Calculer l'heure de fin après 30 minutes
      let totalMinutes = currentHour * 60 + currentMinute + 30; // Ajouter 30 minutes
      const endHour = Math.floor(totalMinutes / 60);
      const endMinute = totalMinutes % 60;
      const endTime = `${String(endHour).padStart(2, "0")}:${String(
        endMinute
      ).padStart(2, "0")}`;

      // Trouver un rapporteur qui n'est pas l'encadrant du sujet
      let rapporteur = null;
      let attempts = 0; // Éviter une boucle infinie si aucune correspondance n'est trouvée
      while (teacherQueue.length > 0 && attempts < teacherQueue.length) {
        const potentialRapporteur = teacherQueue.shift(); // Extraire le premier enseignant de la file
        if (
          potentialRapporteur._id.toString() !== subject.teacher._id.toString()
        ) {
          rapporteur = potentialRapporteur;
          teacherQueue.push(potentialRapporteur); // Remettre l'enseignant à la fin de la file
          break;
        }
        teacherQueue.push(potentialRapporteur); // Réinsérer l'enseignant à la fin de la file
        attempts++;
      }

      if (!rapporteur) {
        return res
          .status(500)
          .json({ message: "Impossible de trouver un rapporteur valide." });
      }

      // Ajouter la soutenance à la liste
      soutenances.push({
        subject: subject._id,
        date,
        startTime,
        endTime,
        room,
        teacher: subject.teacher._id,
        rapporteur: rapporteur._id,
      });

      // Mettre à jour les indices pour la prochaine soutenance
      currentHour = endHour;
      currentMinute = endMinute;

      // Si l'heure dépasse 15h00, passer au jour et à la salle suivants
      if (currentHour >= 15 && currentMinute > 0) {
        currentHour = 9; // Réinitialiser à 9h00
        currentMinute = 0; // Réinitialiser les minutes
        currentRoomIndex = (currentRoomIndex + 1) % rooms.length; // Passer à la salle suivante
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

//8.3  Update
export const updateSoutenance = async (req, res) => {
  try {
    const { id } = req.params; // ID de la soutenance à mettre à jour
    const { date, startTime, endTime, room, teacher, rapporteur } = req.body;

    // Récupérer la soutenance existante
    const existingSoutenance = await SoutenancePFA.findById(id);
    if (!existingSoutenance) {
      return res.status(404).json({ message: "Soutenance introuvable." });
    }

    // Calculer `endTime` si non fourni
    let calculatedEndTime = endTime;
    if (!endTime && startTime) {
      const [hour, minute] = startTime.split(":").map(Number);
      const totalMinutes = hour * 60 + minute + 30; // Ajouter 30 minutes
      const endHour = Math.floor(totalMinutes / 60);
      const endMinute = totalMinutes % 60;
      calculatedEndTime = `${String(endHour).padStart(2, "0")}:${String(
        endMinute
      ).padStart(2, "0")}`;
    }
    console.log(existingSoutenance.room, startTime);
    // Vérifier les chevauchements : même horaire, même salle
    const overlappingSoutenanceSameRoom = await SoutenancePFA.findOne({
      _id: { $ne: id }, // Exclure la soutenance en cours d'édition
      room: { $in: [room, existingSoutenance.room] },
      date: { $in: [date, existingSoutenance.date] },
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gte: startTime } },
          ],
        },
        {
          $and: [
            { startTime: { $lte: calculatedEndTime } },
            { endTime: { $gte: calculatedEndTime } },
          ],
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: calculatedEndTime } },
          ],
        },
      ],
    });
    console.log(overlappingSoutenanceSameRoom);
    if (overlappingSoutenanceSameRoom) {
      return res.status(400).json({
        message: "Une autre soutenance occupe déjà cet horaire et cette salle.",
      });
    }

    // Vérifier les chevauchements : même horaire, salle différente
    const overlappingSoutenanceDifferentRoom = await SoutenancePFA.findOne({
      _id: { $ne: id }, // Exclure la soutenance en cours d'édition
      room: { $ne: room },
      date: { $in: [date, existingSoutenance.date] },
      $or: [
        { teacher: teacher || existingSoutenance.teacher },
        { rapporteur: rapporteur || existingSoutenance.rapporteur },
      ],
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gte: startTime } },
          ],
        },
        {
          $and: [
            { startTime: { $lte: calculatedEndTime } },
            { endTime: { $gte: calculatedEndTime } },
          ],
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: calculatedEndTime } },
          ],
        },
      ],
    });

    if (overlappingSoutenanceDifferentRoom) {
      if (!teacher && !rapporteur) {
        // Cas où aucun enseignant ni rapporteur n'est fourni
        return res.status(400).json({
          message:
            "Un enseignant ou un rapporteur existe déjà dans une autre salle au même horaire. Veuillez les modifier.",
        });
      }
      // Cas où les enseignants sont fournis : vérifier qu'ils ne sont pas engagés ailleurs
      const isTeacherOccupied =
        overlappingSoutenanceDifferentRoom.teacher.toString() ===
          (teacher || existingSoutenance.teacher).toString() ||
        overlappingSoutenanceDifferentRoom.rapporteur.toString() ===
          (teacher || existingSoutenance.teacher).toString();
      const isRapporteurOccupied =
        overlappingSoutenanceDifferentRoom.teacher.toString() ===
          (rapporteur || existingSoutenance.rapporteur).toString() ||
        overlappingSoutenanceDifferentRoom.rapporteur.toString() ===
          (rapporteur || existingSoutenance.rapporteur).toString();

      if (isTeacherOccupied || isRapporteurOccupied) {
        return res.status(400).json({
          message:
            "Un enseignant ou un rapporteur est déjà assigné dans une autre salle au même horaire.",
        });
      }
    }

    // Mise à jour des champs en une seule opération
    const updatedSoutenance = await SoutenancePFA.findByIdAndUpdate(
      id,
      {
        date,
        startTime,
        endTime: calculatedEndTime,
        room,
        ...(teacher && { teacher }),
        ...(rapporteur && { rapporteur }),
      },
      { new: true } // Retourner le document mis à jour
    );

    res.status(200).json({
      message: "Soutenance mise à jour avec succès.",
      soutenance: updatedSoutenance,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la soutenance :", error);
    res.status(500).json({ message: error.message });
  }
};
