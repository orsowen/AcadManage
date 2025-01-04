import Subject_PFA from "../models/Subject_PFA.js";
import DepositPeriod from "../models/DepositPeriod.js";
import { sendMail } from "./mailer.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import Teacher from "../models/Teachers.js";
import Choice from "../models/Choice.js";
import dotenv from "dotenv";

dotenv.config();

// Create multiple subjects
export const createSubjects = async (req, res) => {
  try {
    const { subjects } = req.body;
    const teacherId = req.user.idRole;

    if (!Array.isArray(subjects)) {
      return res
        .status(400)
        .json({ message: "Invalid input, expected an array of subjects" });
    }

    // Check if we are in the deposit period
    const depositPeriod = await DepositPeriod.findOne({ For: "PFA" });
    if (!depositPeriod) {
      return res.status(400).json({ message: "Deposit period not found" });
    }

    const currentDate = new Date();
    const endDepositDate = new Date(depositPeriod.End_Deposit);
    endDepositDate.setHours(23, 59, 59, 999);

    if (
      currentDate < depositPeriod.Start_Deposit ||
      currentDate > endDepositDate
    ) {
      return res.status(400).json({ message: "Not in the deposit period" });
    }

    // Vérifier que les étudiants existent et qu'ils ne sont pas déjà affectés à un autre sujet publié
    for (const subject of subjects) {
      const { binomeExits, binome, monome } = subject;

      if (monome && binomeExits == false) {
        const monomeExists = await Student.exists({ _id: monome });
        if (!monomeExists) {
          return res.status(400).json({
            message: `Monome student with ID ${monome} does not exist`,
          });
        }

        // const monomeAssigned = await Subject_PFA.exists({
        //   $or: [{ monome }, { binome: monome }],
        // });
        // if (monomeAssigned) {
        //   return res.status(400).json({
        //     message: `Monome student with ID ${monome} is already assigned to another published subject`,
        //   });
        // }
      }
      if (binomeExits && binome == undefined && monome !== undefined) {
        return res.status(400).json({
          message: `Binome obligatoire`,
        });
      }

      if (binomeExits && binome !== undefined) {
        const binomeExists = await Student.exists({ _id: binome });

        if (!binomeExists) {
          return res.status(400).json({
            message: `Binome student with ID ${binome} does not exist`,
          });
        }
        // const binomeAssigned = await Subject_PFA.exists({
        //   $or: [{ binome }, { monome: binome }],
        // });

        // if (binomeAssigned) {
        //   return res.status(400).json({
        //     message: `Binome student with ID ${binome} is already assigned to another published subject`,
        //   });
        // }
      }
    }

    const newSubjects = subjects.map((subject) => {
      const { binomeExits, title, description, binome, monome, technologies } =
        subject;
      let addedSubject;

      if (binomeExits) {
        addedSubject = {
          binomeExits,
          title,
          description,
          binome,
          monome,
          teacher: teacherId,
          technologies,
        };
      } else {
        addedSubject = {
          binomeExits,
          title,
          description,
          monome,
          teacher: teacherId,
          technologies,
        };
      }

      return new Subject_PFA(addedSubject);
    });

    const insertedSubjects = await Subject_PFA.insertMany(newSubjects);

    // Mettre à jour les étudiants pour les affecter aux nouveaux sujets et créer des choix
    for (const subject of insertedSubjects) {
      const { binome, monome } = subject;

      const monomeChoice = new Choice({
        student: monome,
        subject: subject._id,
        binome: binome || null,
        teacherAcceptance: true,
      });
      if (monome) {
        await monomeChoice.save();


        // Mettre à jour le monome avec l'ID du choix
        await Student.findByIdAndUpdate(monome,{
          $push: { choices: monomeChoice._id },
        });
      }
      if (binome) {
        const binomeChoice = new Choice({
          student: binome,
          subject: subject._id,
          binome: monome,
          teacherAcceptance: true,
        });
  

        await binomeChoice.save();

        // Mettre à jour le binome avec l'ID du choix
        await Student.findByIdAndUpdate(binome,  {
          $push: { choices: binomeChoice._id },
        });
      }
    }

    res.status(201).json({ message: "Sujets créés avec succès" , insertedSubjects});
  } catch (error) {
    console.error("Error inserting subjects:", error);
    if (error.message.includes("binome is required when binomeExits is true")) {
      return res.status(400).json({
        message: "binome is required when binomeExits is true",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// Publish approved subjects and manage statuses
export const publishSubjects = async (req, res) => {
  try {
    const previouslyPublishedSubjects = await Subject_PFA.find({
      published: true,
    });

    const publishedSubjects = await Subject_PFA.updateMany(

      { status: "Approved" , isArchived: false},
      { $set: { published: true, hidden: false } } // Publier et rendre visible
    );

    const hiddenRejectedSubjects = await Subject_PFA.updateMany(
      { status: "Rejected" },
      { $set: { hidden: true, published: false } }
    );

    const hiddenPendingSubjects = await Subject_PFA.updateMany(
      { status: "Pending" },
      { $set: { hidden: true, published: false } }
    );

    const choicePeriod = await DepositPeriod.findOneAndUpdate(
      { For: "PFA" },
      {
        Start_Choice: new Date(),
        End_Choice: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Durée : 1 mois
      },
      { new: true }
    );

    if (!choicePeriod) {
      return res.status(400).json({ message: "Choice period not found" });
    }

    res.status(200).json({
      message: "Subjects published and choice period opened successfully",
    });

    if (previouslyPublishedSubjects.length === 0) {
      await firstSend();
    } else {
      await modifiedSend();
    }
  } catch (error) {
    console.error("Error publishing subjects:", error);
    res.status(500).json({ message: error.message });
  }
};

// Send the first email after the first publication
export const firstSend = async () => {
  try {
    const users = await User.find()
      .populate("student", "grade")
      .exec();

    const emails = users
      .map((user) => {
        if (user.role === "student" && user.student?.grade === "ING2") {
          return user.email;
        } else if (user.role === "teacher") {
          return user.email;
        }
      })
      .filter((email) => email);  // Remove undefined values

    if (emails.length === 0) {
      throw new Error("No recipients defined");
    }
    const subject =
      "Publication des sujets et ouverture de la période de choix";
    const html = `
      <p>Les sujets ont été publiés.</p>
      <p>Vous pouvez consulter la liste des sujets en cliquant sur le lien ci-dessous :</p>
      <a href="http://localhost:8800/PFA/mine">Voir la liste des sujets</a>
    `;

    for (const email of emails) {
      await sendMail(email, subject, html);
    }

    console.log("Premier envoi effectué avec succès.");
  } catch (error) {
    console.error("Error during first send:", error);
  }
};

// Send the first email after the second publication
export const modifiedSend = async () => {
  try {
    const users = await User.find()
      .populate("student", "grade")
      .exec();
    const emails = users
      .map((user) => {
        if (user.role === "student" && user.student?.grade === "ING2") {
          return user.email;
        } else if (user.role === "teacher") {
          return user.email;
        }
      })
      .filter((email) => email);  // Remove undefined values

    if (emails.length === 0) {
      throw new Error("No recipients defined");
    }
    const subject = "Modification des sujets";
    const html = `
      <p>Les sujets ont été modifiés.</p>
      <p>Vous pouvez consulter la liste des sujets en cliquant sur le lien ci-dessous :</p>
      <a href="http://localhost:8800/PFA/mine">Voir la liste des sujets</a>
    `;

    for (const email of emails) {
      await sendMail(email, subject, html);
    }

    console.log("Envoi modifié effectué avec succès.");
  } catch (error) {
    console.error("Error during modified send:", error);
  }
};


// Get all subjects for Admin
export const getSubjects = async (req, res) => {
  try {

    const subjects = await Subject_PFA.find({ isArchived: false })
      .populate("binome", "firstName lastName email") // Populate binome with specific fields
      .populate("monome", "firstName lastName email") // Populate monome with specific fields
      .populate("teacher", "firstName lastName email"); // Populate teacher with specific fields


    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all subjects by the authenticated teacher
export const getSubjectsByTeacher = async (req, res) => {
  try {
    const teacherId = req.user.idRole;


    const subjects = await Subject_PFA.find({ teacher: teacherId , isArchived: false})
      .populate("binome", "firstName lastName email") // Populate binome with specific fields
      .populate("monome", "firstName lastName email"); // Populate monome with specific fields

    if (!subjects || subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No subjects found for this teacher" });
    }

    const subjectsWithoutTeacher = subjects.map((subject) => {
      const { teacher, ...subjectWithoutTeacher } = subject.toObject();
      return subjectWithoutTeacher;
    });

    res.status(200).json(subjectsWithoutTeacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a subject by ID for the authenticated teacher
export const getSubjectByIdForTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.idRole;


    const subject = await Subject_PFA.findOne({ _id: id, teacher: teacherId , isArchived: false})
      .populate("binome", "firstName lastName email") // Populate binome with specific fields
      .populate("monome", "firstName lastName email"); // Populate monome with specific fields


    if (!subject) {
      return res.status(404).json({
        message:
          "Subject not found or you do not have permission to view this subject",
      });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a subject by ID
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject_PFA.findById(id)
      .populate("binome", "firstName lastName email")
      .populate("monome", "firstName lastName email")
      .populate("teacher", "firstName lastName email");

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a subject for a specific teacher
export const updateSubject = async (req, res) => {
  try {
    // Check if we are in the deposit period
    const depositPeriod = await DepositPeriod.findOne({ For: "PFA" });
    if (!depositPeriod) {
      return res.status(400).json({ message: "Deposit period not found" });
    }

    const currentDate = new Date();
    const endDepositDate = new Date(depositPeriod.End_Deposit);
    endDepositDate.setHours(23, 59, 59, 999);

    console.log("Current Date:", currentDate);
    console.log("Start Deposit:", depositPeriod.Start_Deposit);
    console.log("End Deposit:", endDepositDate);

    if (
      currentDate < depositPeriod.Start_Deposit ||
      currentDate > endDepositDate
    ) {
      return res.status(400).json({ message: "Not in the deposit period" });
    }

    const { id } = req.params;
    const teacherId = req.user.idRole;
    const { binomeExits, title, description, binome, monome, technologies } =
      req.body;

    let updatedSubject = {
      binomeExits,
      title,
      description,
      binome,
      monome,
      teacher: teacherId,
      technologies,
    };

    const subject = await Subject_PFA.findOneAndUpdate(

      { _id: id, teacher: teacherId , isArchived : false}, // Ensure the subject belongs to the authenticated teacher
      updatedSubject,
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({
        message:
          "Subject not found or you do not have permission to update this subject",
      });
    }

    const { teacher, ...subjectWithoutTeacher } = subject.toObject();

    res.status(200).json(subjectWithoutTeacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a subject for a specific teacher
export const deleteSubject = async (req, res) => {
  try {
    // Check if we are in the deposit period
    const depositPeriod = await DepositPeriod.findOne({ For: "PFA" });
    if (!depositPeriod) {
      return res.status(400).json({ message: "Deposit period not found" });
    }
    const currentDate = new Date();
    const endDepositDate = new Date(depositPeriod.End_Deposit);
    endDepositDate.setHours(23, 59, 59, 999);

    console.log("Current Date:", currentDate);
    console.log("Start Deposit:", depositPeriod.Start_Deposit);
    console.log("End Deposit:", endDepositDate);

    if (
      currentDate < depositPeriod.Start_Deposit ||
      currentDate > endDepositDate
    ) {
      return res.status(400).json({ message: "Not in the deposit period" });
    }

    const { id } = req.params;
    const teacherId = req.user.idRole;

    const subject = await Subject_PFA.findOneAndDelete({
      _id: id,
      teacher: teacherId,
    });

    if (!subject) {
      return res.status(404).json({
        message:
          "Subject not found or you do not have permission to delete this subject",
      });
    }

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rejeter un sujet
export const rejectSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject_PFA.findByIdAndUpdate(
      id,

      { status: "Rejected" , isArchived: false},
      { new: true } // Retourner le document mis à jour
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({ message: "Subject rejected successfully", subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approuver un sujet
export const approveSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject_PFA.findByIdAndUpdate(
      id,

      { status: "Approved" , isArchived: false},  
      { new: true } // Retourner le document mis à jour
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({ message: "Subject approved successfully", subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//4.1 get subject by id teacher for student 
export const PFASubjectsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required." });
    }


    // Rechercher les sujets proposés par cet enseignant, triés par title
    const subjects = await Subject_PFA.find({ teacher: teacherId , isArchived: false})
      .select("title description technologies") // Sélectionner uniquement les champs spécifiés
      .sort({ title: 1 }); // Trier par `title` (ordre croissant)// Trier par `title` (ordre croissant)

    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No subjects found for this teacher." });
    }

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects for teacher:", error);
    res.status(500).json({ message: error.message });
  }
};

// //8.1
// export const generateSoutenances = async (req, res) => {
//   try {
//     const { days, rooms } = req.body; // Liste des jours et salles disponibles

//     if (!days || !rooms || days.length === 0 || rooms.length === 0) {
//       return res.status(400).json({
//         message: "Veuillez fournir des jours et des salles disponibles.",
//       });
//     }

//     const subjects = await Subject_PFA.find({ status: "Approved" })
//       .populate("teacher", "firstName lastName")
//       .exec();

//     if (subjects.length === 0) {
//       return res.status(404).json({ message: "Aucun sujet approuvé trouvé." });
//     }

//     const teachers = await Teacher.find().exec();

//     let soutenances = [];
//     let currentDayIndex = 0;
//     let currentRoomIndex = 0;
//     let currentHour = 9; // Début à 9h00

//     for (const subject of subjects) {
//       // Déterminer la date et la salle
//       const date = days[currentDayIndex];
//       const room = rooms[currentRoomIndex];

//       // Ajouter une soutenance
//       const startTime = `${currentHour}:00`;
//       const endTime = `${currentHour + 0.5}:00`;

//       // Trouver un rapporteur différent de l'encadrant
//       const rapporteur = teachers.find(
//         (teacher) => teacher._id.toString() !== subject.teacher._id.toString()
//       );

//       if (!rapporteur) {
//         return res
//           .status(500)
//           .json({ message: "Impossible de trouver un rapporteur." });
//       }

//       soutenances.push({
//         subject: subject._id,
//         date,
//         startTime,
//         endTime,
//         room,
//         teacher: subject.teacher._id,
//         rapporteur: rapporteur._id,
//       });

//       // Mettre à jour les indices pour jour, salle et heure
//       currentHour += 0.5; // Ajouter 30 minutes
//       if (currentHour >= 15) {
//         // Fin de journée à 15h
//         currentHour = 9; // Revenir à 9h le jour suivant
//         currentRoomIndex = (currentRoomIndex + 1) % rooms.length; // Changer de salle
//         currentDayIndex = (currentDayIndex + 1) % days.length; // Passer au jour suivant
//       }
//     }

//     // Sauvegarder les soutenances
//     await SoutenancePFA.insertMany(soutenances);

//     res
//       .status(201)
//       .json({ message: "Soutenances générées avec succès.", soutenances });
//   } catch (error) {
//     console.error("Erreur lors de la génération des soutenances :", error);
//     res.status(500).json({ message: error.message });
//   }
// };
