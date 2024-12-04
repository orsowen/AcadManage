import Choice from '../models/Choice.js';
import Student from '../models/Student.js';
import Subject_PFA from "../models/Subject_PFA.js";

// Ajouter un choix de sujet pour un étudiant
export const addChoice = async (req, res) => {
  try {
    const { studentId, subjectId, priority, binomeId } = req.body;

    // Vérifier que la priorité est valide
    if (![1, 2, 3].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority value' });
    }

    // Vérifier que l'étudiant n'a pas déjà sélectionné trois sujets
    const student = await Student.findById(studentId).populate('choices');
    if (student.choices.length >= 3) {
      return res.status(400).json({ message: 'Student has already selected three subjects' });
    }

    // Vérifier que le sujet est un sujet en binôme
    const subject = await Subject_PFA.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    if (subject.binome && !binomeId) {
      return res.status(400).json({ message: 'Binome ID is required for binome subjects' });
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
      const binome = await Student.findById(binomeId).populate('choices');
      if (!binome) {
        return res.status(404).json({ message: 'Binome not found' });
      }
      if (binome.choices.length >= 3) {
        return res.status(400).json({ message: 'Binome has already selected three subjects' });
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

    res.status(201).json({ message: 'Choice added successfully', choice: newChoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les choix de sujets d'un étudiant
export const getChoices = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate({
      path: 'choices',
      populate: {
        path: 'subject binome',
        model: 'Subject_PFA Student',
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student.choices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};