import Subject_PFA from "../models/Subject_PFA.js";
import SoutenancePFA from "../models/SoutenancePFA.js";
import Teacher from "../models/Teachers.js";
import Choice from "../models/Choice.js";
import dotenv from "dotenv";
import User from "../models/User.js";
import { sendMail } from "./mailer.js";
import PlanningPFA from "../models/SoutenancePFA.js";

dotenv.config();

//8.1 Generate defensePFA
export const generateSoutenances = async (req, res) => {
  try {
    const { days, rooms } = req.body;

    if (!days || !rooms || days.length === 0 || rooms.length === 0) {
      return res.status(400).json({
        message: "Veuillez fournir des jours et des salles disponibles.",
      });
    }

    const validChoices = await Choice.find({ valid: true })
      .select("subject")
      .exec();
    const validSubjectIds = validChoices.map((choice) => choice.subject);

    if (validSubjectIds.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun sujet validé trouvé dans les choix." });
    }

    // Récupérer les sujets approuvés avec leurs encadrants
    const subjects = await Subject_PFA.find({ _id: { $in: validSubjectIds } })
      .populate("teacher", "firstName lastName")
      .exec();

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

      let rapporteur = null;
      let attempts = 0; // Éviter une boucle infinie si aucune correspondance n'est trouvée
      console.log("Contenu initial de teacherQueue :", teacherQueue);
      while (teacherQueue.length > 0 && attempts < teacherQueue.length) {
        const potentialRapporteur = teacherQueue.shift(); // Extraire le premier enseignant de la file

        // Vérifier que le rapporteur n'est pas l'encadrant du sujet
        if (
          potentialRapporteur._id.toString() !== subject.teacher._id.toString()
        ) {
          // Vérifier s'il n'est pas déjà assigné à une soutenance à la même heure
          const isAlreadyAssigned = soutenances.some(
            (soutenance) =>
              soutenance.rapporteur.toString() ===
                potentialRapporteur._id.toString() &&
              soutenance.date === date && // Vérifier la même date
              soutenance.startTime === startTime // Vérifier la même heure
          );

          // Si le rapporteur n'est pas déjà affecté à une soutenance à cette heure
          if (!isAlreadyAssigned) {
            rapporteur = potentialRapporteur;
            teacherQueue.push(potentialRapporteur); // Remettre l'enseignant à la fin de la file
            break;
          }
        }
        // Remettre l'enseignant à la fin de la file si il n'est pas choisi
        teacherQueue.push(potentialRapporteur); // Réinsérer l'enseignant à la fin de la file
        attempts++;
      }

      if (!rapporteur) {
        return res
          .status(500)
          .json({ message: "Impossible de trouver un rapporteur valide." });
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
    await SoutenancePFA.insertMany(soutenances);
    res
      .status(201)
      .json({ message: "Soutenances générées avec succès.", soutenances });
  } catch (error) {
    console.error("Erreur lors de la génération des soutenances :", error);
    res.status(500).json({ message: error.message });
  }
};

//8.2 Admin Getting defense By teacher
export const getPlanningByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    //Récupérer les IDs des sujets validés à partir de Choice
    const validChoices = await Choice.find({ valid: true })
      .select("subject")
      .exec();
    const validSubjectIds = validChoices.map((choice) => choice.subject);

    // Récupérer les soutenances où l'enseignant est encadrant ou rapporteur, et sujet validé
    const planning = await SoutenancePFA.find({
      $or: [{ teacher: teacherId }, { rapporteur: teacherId }],
      subject: { $in: validSubjectIds },
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

//8.2 Admin Getting defense By student
export const getPlanningByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log("Student ID:", studentId);

    // Récupérer les sujets validés liés à l'étudiant
    const validChoices = await Choice.find({
      valid: true,
      $or: [{ student: studentId }, { binome: studentId }],
    })
      .select("subject")
      .exec();

    const validSubjectIds = validChoices.map((choice) => choice.subject);

    if (!validSubjectIds.length) {
      return res.status(404).json({
        message: "Aucun sujet validé trouvé pour cet étudiant.",
      });
    }

    const planning = await SoutenancePFA.find({
      subject: { $in: validSubjectIds },
    })
      .populate("subject", "title teacher")
      .exec();

    if (!planning.length) {
      return res.status(404).json({
        message: "Aucune soutenance trouvée pour cet étudiant.",
      });
    }

    res.status(200).json({ planning });
  } catch (error) {
    console.error("Erreur lors de la récupération du planning :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// 8.3 Update defense
export const updateSoutenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, room, teacher, rapporteur } = req.body;

    const existingSoutenance = await SoutenancePFA.findById(id);
    if (!existingSoutenance) {
      return res.status(404).json({ message: "Soutenance introuvable." });
    }

    // Vérification si l'enseignant existe dans SubjectPFA
    if (teacher) {
      const teacherExists = await Subject_PFA.findOne({ teacher });
      if (!teacherExists) {
        return res.status(400).json({
          message: "L'enseignant spécifié n'a pas de sujet PFA.",
        });
      }
    }

    // Vérification si le rapporteur existe dans SubjectPFA
    if (rapporteur) {
      const rapporteurExists = await Subject_PFA.findOne({
        teacher: rapporteur,
      });
      if (!rapporteurExists) {
        return res.status(400).json({
          message: "Le rapporteur spécifié n'a pas de sujet PFA.",
        });
      }
    }

    // Calculer endTime si non fourni
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

    const roomToCheck = room || existingSoutenance.room;
    const startTimeTocheck = startTime || existingSoutenance.startTime;
    const endTimeTocheck = calculatedEndTime || existingSoutenance.endTime;
    const dateToCheck = date || existingSoutenance.date;

    // Vérifier les chevauchements : même horaire, même salle
    const overlappingSoutenanceSameRoom = await SoutenancePFA.findOne({
      _id: { $ne: id }, // Exclure la soutenance en cours d'édition
      room: roomToCheck,
      date: dateToCheck,
      $or: [
        {
          $and: [
            { startTime: { $gte: startTimeTocheck } },
            { endTime: { $lte: endTimeTocheck } },
          ],
        },
      ],
    });
    if (overlappingSoutenanceSameRoom) {
      return res.status(400).json({
        message: "Une autre soutenance occupe déjà cet horaire et cette salle.",
      });
    }

    // Vérifier les chevauchements : même horaire, mais salle différente
    const overlappingSoutenanceDifferentRoom = await SoutenancePFA.findOne({
      _id: { $ne: id }, // Exclure la soutenance en cours d'édition
      date: dateToCheck,
      $or: [
        {
          teacher: teacher || existingSoutenance.teacher,
        },
        {
          rapporteur: rapporteur || existingSoutenance.rapporteur,
        },
      ],
      $or: [
        {
          $and: [
            {
              startTime: { $lt: endTimeTocheck },
              endTime: { $gt: startTimeTocheck },
            },
          ],
        },
      ],
    });

    if (overlappingSoutenanceDifferentRoom) {
      return res.status(400).json({
        message:
          "Un enseignant ou un rapporteur est déjà assigné dans une autre salle au même horaire.",
      });
    }

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
      { new: true }
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

//8.4 Publish/mask
export const publishSoutenance = async (req, res) => {
  try {
    const { response } = req.params;
    if (!["publier", "masquer"].includes(response)) {
      return res.status(400).json({ error: "Valeur de response invalide." });
    }
    const result = await SoutenancePFA.updateMany({}, { status: response });
    await SoutenancePFA.updateMany({}, { FirstPublication: false });
    res.status(200).json({
      message: `Les soutenances ont été ${
        response === "publier" ? "publiées" : "masquées"
      } avec succès.`,
      modifiedCount: result.nModified,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la mise à jour des soutenances.",
    });
  }
};

// Sending mail First time
export const firstSend = async () => {
  try {
    // Récupérer les emails des étudiants et enseignants
    const users = await User.find()
      .populate("student", "email")
      .populate("teacher", "email")
      .exec();

    const emails = users.map((user) => user.email);

    if (emails.length === 0) {
      throw new Error("Aucun destinataire défini.");
    }
    const subject = "Publication des soutenances PFA";
    const html = `
      <p>Les soutenances ont été publiées.</p>
      <p>Vous pouvez consulter les détails en cliquant sur le lien ci-dessous :</p>
      <a href="http://localhost:8800/PFA/soutenancePFA">Voir les soutenances</a>
    `;

    for (const email of emails) {
      await sendMail(email, subject, html);
    }

    console.log("Premier envoi effectué avec succès.");
  } catch (error) {
    console.error("Erreur lors du premier envoi :", error);
  }
};

// send mail second time
export const modifiedSend = async () => {
  try {
    // Récupérer les emails des étudiants et enseignants
    const users = await User.find()
      .populate("student", "email")
      .populate("teacher", "email")
      .exec();

    const emails = users.map((user) => user.email);

    if (emails.length === 0) {
      throw new Error("Aucun destinataire défini.");
    }

    const subject = "Mise à jour des soutenances PFA";
    const html = `
      <p>Les soutenances ont été mises à jour.</p>
      <p> Veillez consultez les détails mis à jour en cliquant sur le lien ci-dessous :</p>
      <a href="http://localhost:8800/PFA/soutenancePFA">Voir les soutenances mises à jour</a>
    `;

    for (const email of emails) {
      await sendMail(email, subject, html);
    }

    console.log("Envoi modifié effectué avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'envoi modifié :", error);
  }
};

// 8.5 Send mail
export const sendEmail = async (req, res) => {
  try {
    // Vérifier si c'est la première publication
    const firstPublication = await SoutenancePFA.findOne({
      FirstPublication: true,
    });
    console.log("First publication:", firstPublication);
    // Envoyer la réponse après l'envoi des emails
    res.status(200).json({ message: "Emails sent successfully" });

    // Appeler la fonction firstSend ou modifiedSend après avoir envoyé la réponse
    if (!firstPublication) {
      await SoutenancePFA.updateMany({}, { FirstPublication: true });
      await firstSend();
    } else {
      await modifiedSend();
    }
    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Erreur lors de l'envoi :", error);
    res
      .status(500)
      .json({ error: "Une erreur est survenue lors de l'envoi des emails." });
  }
};
// 9.3 Get soutennace details for a student
export const getSoutenanceDetailsForStudent = async (req, res) => {
  try {
    //const { studentId } = req.params;
    const studentId = req.user.idRole;
    const validChoices = await Choice.find({
      valid: true,
      $or: [{ student: studentId }, { binome: studentId }],
    })
      .select("subject")
      .exec();

    const validSubjectIds = validChoices.map((choice) => choice.subject);

    if (!validSubjectIds.length) {
      return res
        .status(404)
        .json({ message: "Aucun sujet validé trouvé pour cet étudiant." });
    }

    const soutenance = await SoutenancePFA.findOne({
      subject: { $in: validSubjectIds },
    })
      .populate("subject", "title")
      .populate({
        path: "teacher", // Charger l'enseignant encadrant
        select: "firstName lastName",
        populate: {
          path: "user", // Charger les infos du teacher
          select: "email",
        },
      })
      .populate({
        path: "rapporteur", // Charger le rapporteur
        select: "firstName lastName",
        populate: {
          path: "user", // Charger les infos du rapporteur
          select: "email",
        },
      })
      .exec();
    if (!soutenance) {
      return res
        .status(404)
        .json({ message: "Aucune soutenance trouvée pour cet étudiant." });
    }

    const details = {
      date: soutenance.date,
      startTime: soutenance.startTime,
      endTime: soutenance.endTime,
      room: soutenance.room,
      teacher: {
        firstName: soutenance.teacher.firstName,
        lastName: soutenance.teacher.lastName,
        email: soutenance.teacher.user?.email, // Récupérer l'email de l'enseignant
      },
      rapporteur: {
        firstName: soutenance.rapporteur.firstName,
        lastName: soutenance.rapporteur.lastName,
        email: soutenance.rapporteur.user?.email, // Récupérer l'email du rapporteur
      },
    };

    res.status(200).json({ details });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails de la soutenance :",
      error
    );
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

//9.1
export const getSoutenancesForTeacher = async (req, res) => {
  try {
    const teacherId = req.user.idRole; // Extract teacher ID from authenticated user

    // Find soutenances where the authenticated teacher is either the teacher or the rapporteur
    const soutenances = await PlanningPFA.find({
      $or: [{ teacher: teacherId }, { rapporteur: teacherId }],
    }).populate("subject", "title"); // Populate subject with specific fields

    if (!soutenances.length) {
      return res.status(404).json({
        message: "No soutenances found for this teacher",
      });
    }
    // Extract and return only the subject field from each soutenance
    const subjects = soutenances.map((soutenance) => soutenance.subject);
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// details of a specific subject for the authenticated teacher 9.2
export const getSubjectByIdForTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.idRole; // Extract teacher ID from authenticated user

    const soutenanceSubject = await PlanningPFA.findOne({
      _id: id,
      $or: [{ teacher: teacherId }, { rapporteur: teacherId }],
    })
      .select("-status -__v -teacher -date -startTime -endTime -room") // Exclude status, __v, and teacher fields
      .populate({
        path: "subject",
        model: "Subject_PFA",
        select: "title description technologies binome monome", // Sélectionner uniquement les champs spécifiés
        populate: {
          path: "binome",
          model: "Student",
          select: "firstName lastName email", // Sélectionner les champs spécifiques de l'enseignant
        },
        populate: {
          path: "binome",
          model: "Student",
          select: "firstName lastName email",
        },
        populate: {
          path: "monome",
          model: "Student",
          select: "firstName lastName email",
        },
      })
      .populate({
        path: "rapporteur",
        model: "Teacher",
        select: "firstName lastName email", // Champs spécifiques pour le rapporteur
      });

    if (!soutenanceSubject) {
      return res.status(404).json({
        message:
          "Subject not found or you do not have permission to view this subject",
      });
    }

    res.status(200).json(soutenanceSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
