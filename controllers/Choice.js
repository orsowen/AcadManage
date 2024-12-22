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
    // const assignedSubject = await Subject_PFA.findOne({
    //   $or: [{ monome: studentId }, { binome: studentId }],
    // });
    // if (assignedSubject) {
    //   return res.status(400).json({
    //     message:
    //       "You have already an assigned subject and cannot add more choices",
    //   });
    // }

    // Vérifier que le sujet est publié
    const subject = await Subject_PFA.findOne({
      _id: subjectId,
      published: true,
    });
    if (!subject) {
      return res.status(404).json({ message: "Published subject not found" });
    }

    // Vérifier que le sujet est un sujet en binôme
    if (subject.binomeExits && !binomeId) {
      return res
        .status(400)
        .json({ message: "Binome ID is required for binome subjects" });
    }

    // Vérifier si le sujet avec la même priorité existe déjà pour cet étudiant

    // const Subjects = await Subject_PFA.findOne({
    //   _id: subjectId,
    //   $or: [
    //     { binomeExits: true, binome: { $ne: null }, monome: { $ne: null } },
    //     { binomeExits: false, monome: { $ne: null } },
    //   ],
    // });

    // if (Subjects) {
    //   return res
    //     .status(400)
    //     .json({ message: "Subject is already assigned to a student" });
    // }

    // const existingChoice = student.choices.find(
    //   (choice) => choice.subject.toString() === subjectId
    // );
    // if (existingChoice) {
    //   return res
    //     .status(400)
    //     .json({ message: "A Subject is already assigned to this student" });
    // }
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
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour la priorité d'un choix de sujet pour un étudiant
export const updatePriority = async (req, res) => {
  try {
    const { choiceId, newPriority } = req.body;
    const studentId = req.user.idRole;

    // Vérifier que la nouvelle priorité est valide
    if (![1, 2, 3].includes(newPriority)) {
      return res.status(400).json({ message: "Invalid priority value" });
    }

    // Trouver le choix
    const choice = await Choice.findById(choiceId).populate("student");
    if (!choice) {
      return res.status(404).json({ message: "Choice not found" });
    }
     // Vérifier que le choix appartient à l'étudiant authentifié
     if (choice.student._id.toString() !== studentId) {
      return res.status(403).json({ message: "You are not authorized to update this choice" });
    }

    // Vérifier que la nouvelle priorité est unique pour l'étudiant
    const student = await Student.findById(studentId).populate("choices");

    
    const existingPriorityChoice = student.choices.find(
      (c) => c.priority === newPriority && c._id.toString() !== choiceId
    );

    // Si un autre choix a déjà la nouvelle priorité, mettez à jour sa priorité pour qu'elle corresponde à l'ancienne priorité
    if (existingPriorityChoice) {
      existingPriorityChoice.priority = choice.priority;
      await existingPriorityChoice.save();
    }

    // Mettre à jour la priorité du choix actuel
    choice.priority = newPriority;
    await choice.save();

    // Si le choix a un binôme, mettre à jour la priorité pour le binôme également
    if (choice.binome) {
      const binomeChoices = await Choice.find({
        student: choice.binome,
        subject: choice.subject,
      });
      for (const binomeChoice of binomeChoices) {
        // Vérifier si un autre choix du binôme a déjà la nouvelle priorité
        const binomeExistingPriorityChoice = await Choice.findOne({
          student: choice.binome,
          priority: newPriority,
          _id: { $ne: binomeChoice._id },
        });

        // Si un autre choix du binôme a déjà la nouvelle priorité, mettez à jour sa priorité pour qu'elle corresponde à l'ancienne priorité
        if (binomeExistingPriorityChoice) {
          binomeExistingPriorityChoice.priority = binomeChoice.priority;
          await binomeExistingPriorityChoice.save();
        }

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

    const choice = await Choice.findById(choiceId).populate("student");
    if (!choice) {
      return res.status(404).json({ message: "Choice not found" });
    }

    let binomeChoice = null;

    // Vérifier si le choix a un binôme
    if (choice.binome) {
      // Trouver le choix du binôme
      binomeChoice = await Choice.findOne({
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
    }

    choice.teacherAcceptance = true;
    await choice.save();

    await Choice.updateMany(
      {
        _id: { $ne: choice._id },
        student: choice.student._id,
      },
      { teacherAcceptance: false }
    );

    if (binomeChoice) {
      await Choice.updateMany(
        {
          _id: { $ne: binomeChoice._id },
          student: choice.binome,
        },
        { teacherAcceptance: false }
      );
    }

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
    const studentId = req.user.idRole;
    console.log(studentId);
    const student = await Student.findById(studentId).populate({
      path: "choices",
      populate: [
        {
          path: "subject",
          model: "Subject_PFA",
          select: "title description technologies teacher", // Sélectionner uniquement les champs spécifiés
          populate: {
            path: "teacher",
            model: "Teacher",
            select: "firstName lastName email", // Sélectionner les champs spécifiques de l'enseignant
          },
        },
        {
          path: "binome",
          model: "Student",
          select: "firstName lastName email",
        }, // Sélectionner les champs spécifiques du binome
      ],
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Préparer les choix pour la réponse
    const choices = student.choices.map((choice) => {
      const { title, description, technologies, teacher } = choice.subject;
      const result = {
        title,
        description,
        technologies,
        teacher,
        teacherAcceptance: choice.teacherAcceptance,
      };
      if (choice.binome) {
        result.binome = choice.binome;
      }
      return result;
    });

    res.status(200).json(choices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les détails d'un choix spécifique d'un étudiant
export const getChoiceById = async (req, res) => {
  try {
    const studentId = req.user.idRole;
    const choiceId = req.params.id; // Extraire l'ID du choix des paramètres de la requête

    console.log(studentId);
    const student = await Student.findById(studentId).populate({
      path: "choices",
      match: { _id: choiceId }, // Filtrer les choix par ID de choix
      populate: [
        {
          path: "subject",
          model: "Subject_PFA",
          select: "title description technologies teacher", // Sélectionner uniquement les champs spécifiés
          populate: {
            path: "teacher",
            model: "Teacher",
            select: "firstName lastName email", // Sélectionner les champs spécifiques de l'enseignant
          },
        },
        {
          path: "binome",
          model: "Student",
          select: "firstName lastName email",
        }, // Sélectionner les champs spécifiques du binome
      ],
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const choice = student.choices[0]; // Il ne devrait y avoir qu'un seul choix correspondant à l'ID

    if (!choice) {
      return res.status(404).json({ message: "Choice not found" });
    }

    // Préparer le choix pour la réponse
    const { title, description, technologies, teacher } = choice.subject;
    const result = {
      title,
      description,
      technologies,
      teacher,
      teacherAcceptance: choice.teacherAcceptance,
    };
    if (choice.binome) {
      result.binome = choice.binome;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
