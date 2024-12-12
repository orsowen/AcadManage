import Choice from "../models/Choice.js";
import Student from "../models/Student.js";
import Subject_PFA from "../models/Subject_PFA.js";

// Add a choice for a student
export const addChoice = async (req, res) => {
  try {
    const { subjectId, priority, binomeId } = req.body;

    const studentId = req.user.idRole;

    // Vérifier que la priorité est valide
    if (![1, 2, 3].includes(priority)) {
      return res.status(400).json({ message: "Invalid priority value" });
    }

    // Vérifier que l'étudiant n'a pas déjà sélectionné trois sujets
    const student = await Student.findById(studentId).populate("choices");
    if (student.choices.length >= 3) {
      return res
        .status(400)
        .json({ message: "You have already selected three subjects" });
    }

    // Vérifier que l'étudiant n'a pas déjà un sujet affecté
    const assignedSubject = await Subject_PFA.findOne({
      $or: [{ monome: studentId }, { binome: studentId }],
    });
    if (assignedSubject) {
      return res.status(400).json({
        message:
          "You have already an assigned subject and cannot add more choices",
      });
    }

    // Vérifier que le sujet est publié
    const subject = await Subject_PFA.findOne({
      _id: subjectId,
      published: true,
    });
    if (!subject) {
      return res.status(404).json({ message: "Published subject not found" });
    }

    // Vérifier que le sujet est un sujet en binôme
    if (subject.binomeExits && binome) {
      return res
        .status(400)
        .json({ message: "Binome ID is required for binome subjects" });
    }

    // Vérifier si le sujet avec la même priorité existe déjà pour cet étudiant

    const Subjects = await Subject_PFA.findOne({
      _id: subjectId,
      $or: [
        { binomeExits: true, binome: { $ne: null }, monome: { $ne: null } },
        { binomeExits: false, monome: { $ne: null } },
      ],
    });
    if (Subjects) {
      return res
        .status(400)
        .json({ message: "Subject is already assigned to a student" });
    }
    const existingChoice = student.choices.find(
      (choice) => choice.subject.toString() === subjectId
    );
    if (existingChoice) {
      return res
        .status(400)
        .json({ message: "A Subject is already assigned to this student" });
    }
    const existingPriority = student.choices.find(
      (choice) => choice.priority === priority
    );
    if (existingPriority) {
      return res.status(400).json({
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

      // Vérifier que la priorité est unique pour le binôme
      const existingBinomePriority = binome.choices.find(
        (choice) => choice.priority === priority
      );
      if (existingBinomePriority) {
        return res.status(400).json({
          message: `Priority ${priority} is already assigned to another subject for the binome`,
        });
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
      return res.status(400).json({
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

export const updateTeacherAcceptance = async (req, res) => {
  try {
    const { choiceId } = req.body;

    // Trouver le choix principal
    const choice = await Choice.findById(choiceId).populate("student");
    if (!choice) {
      return res.status(404).json({ message: "Choice not found" });
    }

    // Vérifier si le choix a un binôme
    if (!choice.binome) {
      return res
        .status(400)
        .json({ message: "Binome is required for acceptance" });
    }

    // Mettre l'acceptation à TRUE pour le choix principal
    choice.teacherAcceptance = true;
    await choice.save();

    // Mettre l'acceptation à TRUE pour le binôme sur le même sujet
    const binomeChoice = await Choice.findOne({
      student: choice.binome,
      subject: choice.subject,
    });
    if (!binomeChoice) {
      return res
        .status(404)
        .json({ message: "Binome choice not found for the same subject" });
    }
    binomeChoice.teacherAcceptance = true;
    await binomeChoice.save();

    // Désactiver les autres choix pour cet étudiant et son binôme uniquement
    await Choice.updateMany(
      {
        _id: { $nin: [choice._id, binomeChoice._id] }, // Exclure le choix principal et celui du binôme
        $or: [
          { student: choice.student._id }, // Les choix de l'étudiant principal
          { student: choice.binome }, // Les choix du binôme
        ],
      },
      { teacherAcceptance: false }
    );

    res.status(200).json({
      message:
        "Teacher acceptance updated successfully for the student and their binome",
      choice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les choix de sujets d'un étudiant
export const getChoices = async (req, res) => {
  try {
    const { studentId } = req.user.idRole;
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
//4.1 (2eme)

// export const getStudentSubjects = async (req, res) => {
//   try {
//     // Récupérer l'ID de l'utilisateur authentifié
//     const studentId = req.user.idRole;

//     // Trouver l'étudiant lié à cet utilisateur avec les choix et sujets peuplés
//     const studentChoices = await Student.find({ _id: studentId }, "choices")
//     .populate({
//       path: "choices",
//       populate: {
//         path: "subject",
//         select: "titre description technologie type enseignant",
//       },
//     });
//        console.log(studentChoices);

//     // if (!student) {
//     //   return res.status(404).json({ message: "Étudiant non trouvé" });
//     // }

//     // Vérifier si des choix existent
//     if (studentChoices.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "Aucun choix trouvé pour cet étudiant" });
//     }

//     // Retourner les choix avec les sujets
//     res.status(200).json({
//       message: "Sujets récupérés avec succès",
//       subjects: student.choices.map((choice) => ({
//         priority: choice.priority,
//         subject: {
//           titre: choice.subject?.titre,
//           description: choice.subject?.description,
//           technologie: choice.subject?.technologie,
//           type: choice.subject?.type, // Monome ou Binome
//           enseignant: choice.subject?.enseignant,
//         },
//         binome: choice.binome
//           ? `${choice.binome.firstName} ${choice.binome.lastName}`
//           : null,
//         teacherAcceptance: choice.teacherAcceptance,
//       })),
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({
//         message: "Une erreur s'est produite lors de la récupération des sujets",
//       });
//   }
// };
