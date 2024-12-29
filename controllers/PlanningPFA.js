import Subject_PFA from "../models/Subject_PFA.js";
import Teacher from "../models/Teachers.js";
import SoutenancePFA from "../models/SoutenancePFA.js"; // Modèle Soutenance
import dotenv from "dotenv";
import User from "../models/User.js";
import { sendMail } from "./mailer.js";

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

    // // Étape 1 : Récupérer les IDs des sujets validés depuis Choice
    // const validChoices = await Choice.find({ valid: true }).select("subject").exec();
    // const validSubjectIds = validChoices.map((choice) => choice.subject);

    // if (validSubjectIds.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "Aucun sujet validé trouvé dans les choix." });
    // }

    // // Étape 2 : Récupérer les sujets approuvés avec leurs encadrants
    // const subjects = await Subject_PFA.find({ _id: { $in: validSubjectIds } })
    //   .populate("teacher", "firstName lastName")
    //   .exec();

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

      // // Trouver un rapporteur qui n'est pas l'encadrant du sujet
      // let rapporteur = null;
      // let attempts = 0; // Éviter une boucle infinie si aucune correspondance n'est trouvée
      // while (teacherQueue.length > 0 && attempts < teacherQueue.length) {
      //   const potentialRapporteur = teacherQueue.shift(); // Extraire le premier enseignant de la file
      //   if (
      //     potentialRapporteur._id.toString() !== subject.teacher._id.toString()
      //   ) {
      //     rapporteur = potentialRapporteur;
      //     teacherQueue.push(potentialRapporteur); // Remettre l'enseignant à la fin de la file
      //     break;
      //   }
      //   teacherQueue.push(potentialRapporteur); // Réinsérer l'enseignant à la fin de la file
      //   attempts++;
      // }
      let rapporteur = null;
      let attempts = 0; // Éviter une boucle infinie si aucune correspondance n'est trouvée
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
    //     Récupérer les IDs des sujets validés à partir de Choice
    //     const validChoices = await Choice.find({ valid: true }).select("subject").exec();
    //     const validSubjectIds = validChoices.map((choice) => choice.subject);

    //     // Récupérer les soutenances où l'enseignant est encadrant ou rapporteur, et sujet validé
    //     const planning = await SoutenancePFA.find({
    //       $or: [{ teacher: teacherId }, { rapporteur: teacherId }],
    //       subject: { $in: validSubjectIds },
    //     })
    //       .populate("subject", "title student") // Charger les informations du sujet et de l'étudiant
    //       .exec();
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

    // Récupérer les IDs des sujets validés à partir de Choice où l'étudiant est impliqué
    // const validChoices = await Choice.find({
    //   valid: true,
    //   $or: [{ student: studentId }, { binome: studentId }],
    // }).select("subject").exec();

    // const validSubjectIds = validChoices.map((choice) => choice.subject);

    // console.log("Sujets validés trouvés :", validSubjectIds);
    // if (!validSubjectIds || validSubjectIds.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "Aucun sujet validé trouvé pour cet étudiant." });
    // }
    // Chercher toutes les soutenances qui correspondent aux sujets validés trouvés
    //  const planning = await SoutenancePFA.find({
    //   subject: { $in: validSubjectIds },
    // })
    //   .populate({
    //     path: "subject",
    //     select: "title teacher monome binome",
    //     populate: [
    //       { path: "monome", select: "firstName lastName" },
    //       { path: "binome", select: "firstName lastName" },
    //     ],
    //   })
    //   .exec();

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

    // Vérifier que le `teacher` spécifié existe dans SubjectPFA
    if (teacher) {
      const teacherExists = await Subject_PFA.findOne({ teacher });
      if (!teacherExists) {
        return res.status(400).json({
          message: "L'enseignant spécifié  n'a pas de sujet PFA.",
        });
      }
    }
    // Vérifier que le `rapporteur` spécifié existe dans SubjectPFA
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

    // Vérifier les chevauchements : même horaire, salle différente
    const overlappingSoutenanceDifferentRoom = await SoutenancePFA.findOne({
      _id: { $ne: id }, // Exclure la soutenance en cours d'édition
      room: { $ne: room },
      date: dateToCheck,
      teacher: teacher || existingSoutenance.teacher,
      rapporteur: rapporteur || existingSoutenance.rapporteur,
      $or: [
        {
          $and: [
            { startTime: { $gte: startTimeTocheck } },
            { endTime: { $lte: endTimeTocheck } },
          ],
        },
      ],
    });

    if (overlappingSoutenanceDifferentRoom) {
      if (!teacher && !rapporteur) {
        return res.status(400).json({
          message:
            "Un enseignant ou un rapporteur existe déjà dans une autre salle au même horaire. Veuillez les modifier.",
        });
      }

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
//8.4 Publish /mask
export const publishSoutenance = async (req, res) => {
  const { response } = req.params;
  if (!["publier", "masquer"].includes(response)) {
    return res.status(400).json({ error: "Valeur de response invalide." });
  }

  try {
    // const PublishedSoutenance = await SoutenancePFA.find({
    //   status: "publier",
    // });
    //console.log("Previously published soutenances:", PublishedSoutenance);
    // Mettre à jour toutes les soutenances
    const result = await SoutenancePFA.updateMany({}, { status: response });

    res.status(200).json({
      message: `Les soutenances ont été ${
        response === "publier" ? "publiées" : "masquées"
      } avec succès.`,
      modifiedCount: result.nModified,
    });
    // // Appeler la fonction firstSend ou modifiedSend après avoir envoyé la réponse
    // if (PublishedSoutenance.length === 0) {
    //   await firstSend();
    // } else {
    //   await modifiedSend();
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la mise à jour des soutenances.",
    });
  }
};

// Fonction pour envoyer le premier email
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

    // Contenu du mail pour le premier envoi
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

// Fonction pour envoyer un email modifié
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

    // Contenu du mail pour l'envoi modifié
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

// // Contrôleur pour gérer l'envoi d'emails
export const sendEmail = async (req, res) => {
  const { option } = req.params; // `option` est soit "first" soit "modified"

  try {
    if (option === "first") {
      await firstSend();
      return res.status(200).json({ message: "Premier envoi effectué." });
    } else if (option === "modified") {
      await modifiedSend();
      return res.status(200).json({ message: "Envoi modifié effectué." });
    } else {
      return res.status(400).json({
        error: "Option invalide. Choisissez entre 'first' ou 'modified'.",
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi :", error);
    res
      .status(500)
      .json({ error: "Une erreur est survenue lors de l'envoi des emails." });
  }
};
