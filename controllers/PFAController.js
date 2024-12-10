import Subject_PFA from "../models/Subject_PFA.js";
import DepositPeriod from "../models/DepositPeriod.js";
import { sendMail } from "./mailer.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import Teacher from "../models/Teachers.js";
import dotenv from "dotenv";
dotenv.config();

// Create multiple subjects
export const createSubjects = async (req, res) => {
  try {
    const { subjects } = req.body; // Expecting an array of subjects
    const teacherId = req.user.idRole; // Extract teacher ID from authenticated user

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
    endDepositDate.setHours(23, 59, 59, 999); // Set the end deposit date to the end of the day

    console.log("Current Date:", currentDate);
    console.log("Start Deposit:", depositPeriod.Start_Deposit);
    console.log("End Deposit:", endDepositDate);

    if (
      currentDate < depositPeriod.Start_Deposit ||
      currentDate > endDepositDate
    ) {
      return res.status(400).json({ message: "Not in the deposit period" });
    }

    console.log("Received subjects:", subjects);

    // Vérifier que les étudiants existent
    for (const subject of subjects) {
      const { binomeExits, binome, monome } = subject;

      const monomeExists = await Student.exists({ _id: monome });
      if (!monomeExists) {
        return res
          .status(400)
          .json({ message: `Monome student with ID ${monome} does not exist` });
      }

      if (binomeExits) {
        const binomeExists = await Student.exists({ _id: binome });
        if (!binomeExists) {
          return res.status(400).json({
            message: `Binome student with ID ${binome} does not exist`,
          });
        }
      }
    }

    const newSubjects = subjects.map((subject) => {
      const { binomeExits, title, description, binome, monome } = subject;
      let addedSubject;

      if (binomeExits) {
        addedSubject = {
          binomeExits,
          title,
          description,
          binome,
          monome,
          teacher: teacherId, // Use the teacher ID from the authenticated user
        };
      } else {
        addedSubject = {
          binomeExits,
          title,
          description,
          monome,
          teacher: teacherId, // Use the teacher ID from the authenticated user
        };
      }

      console.log("Processed subject:", addedSubject);
      return new Subject_PFA(addedSubject);
    });

    await Subject_PFA.insertMany(newSubjects);
    console.log("Subjects inserted successfully");

    res.status(201).json({ message: "Sujets créés avec succès" });
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
    // Vérifier si des sujets ont déjà été publiés
    const previouslyPublishedSubjects = await Subject_PFA.find({
      published: true,
    });
    console.log("Previously published subjects:", previouslyPublishedSubjects);
    // Publier les sujets approuvés
    const publishedSubjects = await Subject_PFA.updateMany(
      { status: "Approved" },
      { $set: { published: true, hidden: false } } // Publier et rendre visible
    );

    // Cacher les sujets en attente
    const hiddenPendingSubjects = await Subject_PFA.updateMany(
      { status: "Pending" },
      { $set: { hidden: true, published: false } } // Rendre invisible et ne pas publier
    );

    // Ouvrir la période de choix pour les étudiants
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

    // Appeler la fonction firstSend ou modifiedSend après avoir envoyé la réponse
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

export const firstSend = async () => {
  try {
    // Récupérer les emails des étudiants et des enseignants
    const users = await User.find()
      .populate("student", "email")
      .populate("teacher", "email")
      .exec();

    const emails = users.map((user) => user.email);

    if (emails.length === 0) {
      throw new Error("No recipients defined");
    }

    // Envoyer un email de confirmation avec un lien vers la liste des sujets
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

// Handle modified send option
export const modifiedSend = async () => {
  try {
    // Récupérer les emails des étudiants et des enseignants
    const users = await User.find()
      .populate("student", "email")
      .populate("teacher", "email")
      .exec();

    const emails = users.map((user) => user.email);

    if (emails.length === 0) {
      throw new Error("No recipients defined");
    }

    // Envoyer un email de confirmation avec un lien vers la liste des sujets
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
    const subjects = await Subject_PFA.find()
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
    const teacherId = req.user.idRole; // Extract teacher ID from authenticated user

    const subjects = await Subject_PFA.find({ teacher: teacherId })
      .populate("binome", "firstName lastName email") // Populate binome with specific fields
      .populate("monome", "firstName lastName email"); // Populate monome with specific fields

    if (!subjects || subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No subjects found for this teacher" });
    }

    // Remove the teacher field from the results
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
    const teacherId = req.user.idRole; // Extract teacher ID from authenticated user

    const subject = await Subject_PFA.findOne({ _id: id, teacher: teacherId })
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

// Get a subject by ID  ( admine)
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject_PFA.findById(id)
      .populate("binome", "firstName lastName email") // Populate binome with specific fields
      .populate("monome", "firstName lastName email") // Populate monome with specific fields
      .populate("teacher", "firstName lastName email"); // Populate teacher with specific fields

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
    endDepositDate.setHours(23, 59, 59, 999); // Set the end deposit date to the end of the day

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
    const teacherId = req.user.idRole; // Extract teacher ID from authenticated user
    const { binomeExits, title, description, binome, monome } = req.body;

    let updatedSubject = {
      binomeExits,
      title,
      description,
      binome,
      monome,
      teacher: teacherId, // Ensure the teacher ID is set to the authenticated user
    };

    const subject = await Subject_PFA.findOneAndUpdate(
      { _id: id, teacher: teacherId }, // Ensure the subject belongs to the authenticated teacher
      updatedSubject,
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({
        message:
          "Subject not found or you do not have permission to update this subject",
      });
    }

    // Remove the teacher field from the results
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
    endDepositDate.setHours(23, 59, 59, 999); // Set the end deposit date to the end of the day

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
    const teacherId = req.user.idRole; // Extract teacher ID from authenticated user

    const subject = await Subject_PFA.findOneAndDelete({
      _id: id,
      teacher: teacherId,
    }); // Ensure the subject belongs to the authenticated teacher

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

    // Trouver le sujet et mettre à jour son statut
    const subject = await Subject_PFA.findByIdAndUpdate(
      id,
      { status: "Rejected" },
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

    // Trouver le sujet et mettre à jour son statut
    const subject = await Subject_PFA.findByIdAndUpdate(
      id,
      { status: "Approved" },
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

// Lister les sujets triés par enseignant avec pagination
export const PFASubjectsByTeacher = async (req, res) => {
  try {
    // Récupérer l'ID de l'enseignant à partir des paramètres de l'URL
    const { teacherId } = req.params;

    // Vérifier que l'ID est fourni
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required." });
    }

    // Rechercher les sujets proposés par cet enseignant, triés par title
    const subjects = await Subject_PFA.find({ teacher: teacherId })
      .populate("teacher")
      .sort({ title: 1 }); // Trier par `title` (ordre croissant)

    // Vérifier si des sujets ont été trouvés
    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No subjects found for this teacher." });
    }

    // Retourner les sujets trouvés
    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects for teacher:", error);
    res.status(500).json({ message: error.message });
  }
};
