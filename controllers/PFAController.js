import Subject_PFA from "../models/Subject_PFA.js";
import DepositPeriod from "../models/DepositPeriod.js";
import { sendMail } from "./mailer.js";
import dotenv from "dotenv";
dotenv.config();

// Create multiple subjects
export const createSubjects = async (req, res) => {
  try {
    const { subjects } = req.body; // Expecting an array of subjects

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
    console.log("Current Date:", currentDate);
    console.log("Start Deposit:", depositPeriod.Start_Deposit);
    console.log("End Deposit:", depositPeriod.End_Deposit);

    if (
      currentDate < depositPeriod.Start_Deposit ||
      currentDate > depositPeriod.End_Deposit
    ) {
      return res.status(400).json({ message: "Not in the deposit period" });
    }

    console.log("Received subjects:", subjects);

    const newSubjects = subjects.map((subject) => {
      const {
        binome,
        title,
        description,
        lastnameBinome,
        firstnameBinome,
        lastnameMonome,
        firstnameMonome,
        teacher,
      } = subject;
      let addedSubject;

      if (binome) {
        if (!lastnameBinome || !firstnameBinome) {
          throw new Error(
            "lastnameBinome and firstnameBinome are required when binome is true"
          );
        }
        addedSubject = {
          binome,
          title,
          description,
          lastnameBinome,
          firstnameBinome,
          lastnameMonome,
          firstnameMonome,
          teacher,
        };
      } else {
        addedSubject = {
          binome,
          title,
          description,
          lastnameMonome,
          firstnameMonome,
          teacher,
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
    if (
      error.message.includes("lastnameBinome and firstnameBinome are required")
    ) {
      return res.status(400).json({
        message:
          "lastnameBinome and firstnameBinome are required when binome is true",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// Publish approved subjects and manage statuses
export const publishSubjects = async (req, res) => {
  try {
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

    // Cacher les sujets rejetés
    const hiddenRejectedSubjects = await Subject_PFA.updateMany(
      { status: "Rejected" },
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

    const adminEmail = process.env.Email_user;
    const subject =
      "Publication des sujets et ouverture de la période de choix";
    const html = `
       <p>Les sujets ont été publiés et la période de choix a été ouverte.</p>
       <p>Veuillez choisir une option :</p>
       <a href="http://localhost:8800/PFA/first-send">Premier envoi</a>
       <br>
       <a href="http://localhost:8800/PFA/modified-send">Envoi modifié</a>
     `;

    await sendMail(adminEmail, subject, html);

    res.status(200).json({
      message: "Subjects published and choice period opened successfully",
    });
  } catch (error) {
    console.error("Error publishing subjects:", error);
    res.status(500).json({ message: error.message });
  }
};

// Handle first send option
export const firstSend = async (req, res) => {
  try {
    // Logique pour le premier envoi
    await Subject_PFA.updateMany(
      { status: "Approved" },
      { sendStatus: "First Sent" }
    );

    // Envoyer un email de confirmation avec un lien vers la liste des sujets
    const adminEmail = process.env.Email_user; // Remplacez par l'email de l'administrateur
    const subject = "Premier envoi effectué";
    const html = `
        <p>Le premier envoi des sujets a été effectué avec succès.</p>
        <p>Vous pouvez consulter la liste des sujets en cliquant sur le lien ci-dessous :</p>
        <a href="http://localhost:8800/PFA/mine">Voir la liste des sujets</a>
      `;

    await sendMail(adminEmail, subject, html);

    res.status(200).json({ message: "Premier envoi effectué avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Handle modified send option
export const modifiedSend = async (req, res) => {
  try {
    // Logique pour l'envoi modifié
    await Subject_PFA.updateMany(
      { status: "Approved" },
      { sendStatus: "Modified Sent" }
    );

    // Envoyer un email de confirmation avec un lien vers la liste des sujets
    const adminEmail = process.env.Email_user; // Remplacez par l'email de l'administrateur
    const subject = "Envoi modifié effectué";
    const html = `
        <p>L'envoi modifié des sujets a été effectué avec succès.</p>
        <p>Vous pouvez consulter la liste des sujets en cliquant sur le lien ci-dessous :</p>
        <a href="http://localhost:8800/PFA/mine">Voir la liste des sujets</a>
      `;

    await sendMail(adminEmail, subject, html);

    res.status(200).json({ message: "Envoi modifié effectué avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all subjects
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject_PFA.find();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a subject by ID
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject_PFA.findById(id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a subject
export const updateSubject = async (req, res) => {
  try {
    // Check if we are in the deposit period
    const depositPeriod = await DepositPeriod.findOne({ For: "PFA" });
    if (!depositPeriod) {
      return res.status(400).json({ message: "Deposit period not found" });
    }

    const currentDate = new Date();
    console.log("Current Date:", currentDate);
    console.log("Start Deposit:", depositPeriod.Start_Deposit);
    console.log("End Deposit:", depositPeriod.End_Deposit);

    if (
      currentDate < depositPeriod.Start_Deposit ||
      currentDate > depositPeriod.End_Deposit
    ) {
      return res.status(400).json({ message: "Not in the deposit period" });
    }

    const { id } = req.params;
    const {
      binome,
      title,
      description,
      lastnameBinome,
      firstnameBinome,
      lastnameMonome,
      firstnameMonome,
    } = req.body;

    let updatedSubject = {
      binome,
      title,
      description,
      lastnameMonome,
      firstnameMonome,
    };

    if (binome) {
      updatedSubject.lastnameBinome = lastnameBinome;
      updatedSubject.firstnameBinome = firstnameBinome;
    }

    const subject = await Subject_PFA.findByIdAndUpdate(id, updatedSubject, {
      new: true,
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a subject
export const deleteSubject = async (req, res) => {
  try {
    // Check if we are in the deposit period
    const depositPeriod = await DepositPeriod.findOne({ For: "PFA" });
    if (!depositPeriod) {
      return res.status(400).json({ message: "Deposit period not found" });
    }

    const currentDate = new Date();
    console.log("Current Date:", currentDate);
    console.log("Start Deposit:", depositPeriod.Start_Deposit);
    console.log("End Deposit:", depositPeriod.End_Deposit);

    if (
      currentDate < depositPeriod.Start_Deposit ||
      currentDate > depositPeriod.End_Deposit
    ) {
      return res.status(400).json({ message: "Not in the deposit period" });
    }

    const { id } = req.params;

    const subject = await Subject_PFA.findByIdAndDelete(id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
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
