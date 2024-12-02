import Subject_PFA from "../models/Subject_PFA.js";
import DepositPeriod from "../models/DepositPeriod.js";

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
        };
      } else {
        addedSubject = {
          binome,
          title,
          description,
          lastnameMonome,
          firstnameMonome,
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

// Publish subjects and open choice period
export const publishSubjects = async (req, res) => {
    try {
      // Update status of non-rejected subjects to "Approved"
      await Subject_PFA.updateMany({ status: { $ne: "Rejected" } }, { status: "Approved" });
  
      // Hide rejected subjects
      await Subject_PFA.updateMany({ status: "Rejected" }, { hidden: true });
  
      // Open choice period for students
      const choicePeriod = await DepositPeriod.findOneAndUpdate(
        { For: "PFA" },
        { Start_Choice: new Date(), End_Choice: new Date(new Date().setMonth(new Date().getMonth() + 1)) }, // Example: choice period is one month
        { new: true }
      );
  
      if (!choicePeriod) {
        return res.status(400).json({ message: "Choice period not found" });
      }
  
      res.status(200).json({ message: "Subjects published and choice period opened successfully" });
    } catch (error) {
      console.error("Error publishing subjects:", error);
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
