import Choice from "../models/Choice.js";
import Student from "../models/Student.js";
import Subject_PFA from "../models/Subject_PFA.js";
import mongoose from "mongoose";

// Ajouter un choix de sujet pour un étudiant
export const addChoice = async (req, res) => {
  try {
    const { studentId, subjectId, priority, binomeId } = req.body;

    // Vérifier que la priorité est valide
    if (![1, 2, 3].includes(priority)) {
      return res.status(400).json({ message: "Invalid priority value" });
    }

    // Vérifier que l'étudiant n'a pas déjà sélectionné trois sujets
    const student = await Student.findById(studentId).populate("choices");
    if (student.choices.length >= 3) {
      return res
        .status(400)
        .json({ message: "Student has already selected three subjects" });
    }

    // Vérifier que le sujet est un sujet en binôme
    const subject = await Subject_PFA.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    if (subject.binome && !binomeId) {
      return res
        .status(400)
        .json({ message: "Binome ID is required for binome subjects" });
    }

    // Vérifier si le sujet avec la même priorité existe déjà pour cet étudiant
    const existingChoice = student.choices.find(
      (choice) => choice.subject.toString() === subjectId
    );
    if (existingChoice) {
      return res
        .status(400)
        .json({ message: `Subject is already assigned to this student` });
    }

    // Vérifier que la priorité est unique pour l'étudiant
    const existingPriority = student.choices.find(
      (choice) => choice.priority === priority
    );
    if (existingPriority) {
      return res
        .status(400)
        .json({
          message: `Priority ${priority} is already assigned to another subject`,
        });
    }

    // Créer un nouveau choix pour l'étudiant
    const newChoice = new Choice({
      student: studentId,
      subject: subjectId,
      priority,
      binome: binomeId || null,
    });

    // Sauvegarder le choix
    await newChoice.save();

    // Ajouter le choix à l'étudiant
    student.choices.push(newChoice._id);
    await student.save();

    // Si un binôme est ajouté, ajouter le choix au binôme également
    if (binomeId) {
      const binome = await Student.findById(binomeId).populate("choices");
      if (!binome) {
        return res.status(404).json({ message: "Binome not found" });
      }
      if (binome.choices.length >= 3) {
        return res
          .status(400)
          .json({ message: "Binome has already selected three subjects" });
      }

  
      // Créer un nouveau choix pour le binôme
      const binomeChoice = new Choice({
        student: binomeId,
        subject: subjectId,
        priority,
        binome: studentId,
      });

      // Sauvegarder le choix du binôme
      await binomeChoice.save();

      // Ajouter le choix au binôme
      binome.choices.push(binomeChoice._id);
      await binome.save();
    }

    res
      .status(201)
      .json({ message: "Choice added successfully", choice: newChoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour la priorité d'un choix de sujet pour un étudiant
export const updatePriority = async (req, res) => {
  try {
    const { choiceId, newPriority } = req.body;

    // Vérifier que la nouvelle priorité est valide
    if (![1, 2, 3].includes(newPriority)) {
      return res.status(400).json({ message: "Invalid priority value" });
    }

    // Trouver le choix
    const choice = await Choice.findById(choiceId).populate("student");
    if (!choice) {
      return res.status(404).json({ message: "Choice not found" });
    }

    // Vérifier que la nouvelle priorité est unique pour l'étudiant
    const student = await Student.findById(choice.student._id).populate(
      "choices"
    );
    const existingPriority = student.choices.find(
      (c) => c.priority === newPriority && c._id.toString() !== choiceId
    );
    if (existingPriority) {
      return res
        .status(400)
        .json({
          message: `Priority ${newPriority} is already assigned to another subject`,
        });
    }

    // Mettre à jour la priorité
    choice.priority = newPriority;
    await choice.save();

      // Si le choix a un binôme, mettre à jour l'acceptation pour le binôme également
      if (choice.binome) {
        const binomeChoices = await Choice.find({
          student: choice.binome,
          subject: choice.subject,
        });
        for (const binomeChoice of binomeChoices) {
          binomeChoice.priority = newPriority;
          await binomeChoice.save();
        }
      }

    res.status(200).json({ message: "Priority updated successfully", choice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour l'acceptation par l'enseignant pour un choix de sujet
export const updateTeacherAcceptance = async (req, res) => {
  try {
    const { choiceId } = req.body;

    // Trouver le choix
    const choice = await Choice.findById(choiceId).populate('student');
    if (!choice) {
      return res.status(404).json({ message: 'Choice not found' });
    }

    // Mettre à jour l'acceptation par l'enseignant
    choice.teacherAcceptance = true;
    await choice.save();

    // Mettre à jour les autres choix de l'étudiant et du binôme pour empêcher l'acceptation
    await Choice.updateMany(
      { $or: [{ student: choice.student._id }, { student: choice.binome }], _id: { $ne: choiceId } },
      { teacherAcceptance: false }
    );

    // Si le choix a un binôme, mettre à jour l'acceptation pour le binôme également
    if (choice.binome) {
      const binomeChoices = await Choice.find({ student: choice.binome, subject: choice.subject });
      for (const binomeChoice of binomeChoices) {
        binomeChoice.teacherAcceptance = true;
        await binomeChoice.save();
      }
    }

    res.status(200).json({ message: 'Teacher acceptance updated successfully', choice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les choix de sujets d'un étudiant
export const getChoices = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate({
      path: "choices",
      populate: [
        { path: "subject", model: "Subject_PFA" },
        { path: "binome", model: "Student" },
      ],
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student.choices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
