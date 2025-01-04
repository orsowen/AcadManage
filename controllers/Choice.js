import Choice from "../models/Choice.js";
import Student from "../models/Student.js";
import Subject_PFA from "../models/Subject_PFA.js";
import User from "../models/User.js";
import { sendMail } from "./mailer.js";

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
      isArchived: false,
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
      return res
        .status(403)
        .json({ message: "You are not authorized to update this choice" });
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

// Obtenir les choix de sujets d'un étudiant
export const getStudentChoices = async (req, res) => {
  try {
    const studentId = req.params.id;
    console.log(studentId);

    // Chercher les choix directement dans la collection Choice
    const choices = await Choice.find({ student: studentId }).populate({
      path: "subject",
      model: "Subject_PFA",
      select: "title description technologies teacher", // Sélectionner uniquement les champs spécifiés
      populate: {
        path: "teacher",
        model: "Teacher",
        select: "firstName lastName email", // Sélectionner les champs spécifiques de l'enseignant
      },
    }).populate({
      path: "binome",
      model: "Student",
      select: "firstName lastName email", // Sélectionner les champs spécifiques du binome
    });

    if (!choices || choices.length === 0) {
      return res.status(404).json({ message: "No choices found for this student" });
    }

    // Préparer les choix pour la réponse
    const formattedChoices = choices.map((choice) => {
      const { title, description, technologies, teacher } = choice.subject;
      const result = {
        title,
        description,
        technologies,
        teacher,
        teacherAcceptance: choice.teacherAcceptance,
        valid: choice.valid, // Inclure le statut de validation
      };
      if (choice.binome) {
        result.binome = choice.binome;
      }
      return result;
    });

    res.status(200).json(formattedChoices);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

// Affecter automatiquement les choix d'un étudiant

export const autoAssignChoices = async (req, res) => {
  try {
    const students = await Student.find().populate({
      path: "choices",
      populate: [
        {
          path: "subject",
          model: "Subject_PFA",
          select: "title description technologies teacher binome monome",
          populate: {
            path: "teacher",
            model: "Teacher",
            select: "firstName lastName email",
          },
        },
        {
          path: "binome",
          model: "Student",
          select: "firstName lastName email",
        },
      ],
    });

    for (const student of students) {
      // Étape 1 : Vérifier si l'enseignant a ajouté l'étudiant lors de la création du sujet PFA et si l'acceptation de l'enseignant mise par l'étudiant est true
      const approvedChoices = student.choices.filter(
        (choice) =>
          ((choice.subject.monome &&
            choice.subject.monome.toString() === student._id.toString()) ||
            (choice.subject.binome &&
              choice.subject.binome.toString() === student._id.toString())) &&
          choice.teacherAcceptance
      );
      console.log(
        `Approved choices for student ${student._id}:`,
        approvedChoices
      );

      // Marquer les choix approuvés comme valides
      for (const choice of approvedChoices) {
        choice.valid = true;
        await choice.save();
      }

      // Vérifier si aucun choix n'a été validé à l'étape 1
      if (approvedChoices.length === 0) {
        // Étape 2 : Affecter les priorités 1 si pas de conflits
        const priority1Choices = student.choices.filter(
          (choice) =>
            choice.priority === 1 && !choice.teacherAcceptance && !choice.valid
        );

        for (const choice of priority1Choices) {
          // Vérifier si un autre étudiant a déjà ce choix avec priorité 1
          const conflictChoices = await Choice.find({
            subject: choice.subject._id,
            priority: 1,
            valid: true,
          });
          console.log("Conflict choices:", conflictChoices);

          // Vérifier si le conflit est avec le binome du même sujet
          const isConflictWithBinome = conflictChoices.some(
            (conflictChoice) =>
              conflictChoice.binome &&
              conflictChoice.binome.toString() === student._id.toString()
          );

          if (isConflictWithBinome) {
            for (const conflictChoice of conflictChoices) {
              if (
                conflictChoice.binome &&
                conflictChoice.binome.toString() === student._id.toString()
              ) {
                console.log(
                  "Conflict choice b  :",
                  conflictChoice.binome.toString()
                );
                conflictChoice.valid = false;
                await conflictChoice.save();
              }
            }
          }

          // Marquer le choix comme valide si aucun conflit ou si le conflit a été résolu
          if (conflictChoices.length === 0 || isConflictWithBinome) {
            choice.valid = true;
            await choice.save();

            // Marquer le choix du binôme comme valide également
            if (choice.binome) {
              const binomeChoice = await Choice.findOne({
                student: choice.binome,
                subject: choice.subject._id,
              });
              if (binomeChoice) {
                binomeChoice.valid = true;
                await binomeChoice.save();
              }
            }
          } else {
            // Marquer tous les choix en conflit comme invalides
            for (const conflictChoice of conflictChoices) {
              conflictChoice.valid = false;
              await conflictChoice.save();
            }
          }
        }
      }

      // Étape 3 : Laisser les autres choix non affectés
      const otherChoices = student.choices.filter((choice) => !choice.valid);
      for (const choice of otherChoices) {
        choice.valid = false;
        await choice.save();
      }

    }

    res
      .status(200)
      .json({
        message: "Auto assignment completed successfully for all students",
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

// Affecter un sujet PFA à un étudiant
export const assignPFAtoStudent = async (req, res) => {
  try {
    const { id: subjectId, studentId } = req.params;
    const { force } = req.body;

    // Trouver le sujet PFA
    const subject = await Subject_PFA.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Trouver l'étudiant
    const student = await Student.findById(studentId).populate("choices");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Vérifier si le sujet est déjà affecté à un autre étudiant
    const existingChoice = await Choice.findOne({
      subject: subjectId,
      valid: true,
    });
    if (existingChoice) {
      if (existingChoice.student.toString() !== studentId) {
        if (!force) {
          return res
            .status(400)
            .json({ message: "Subject already assigned to another student" });
        } else {
          // Retirer le sujet de l'autre étudiant
          existingChoice.valid = false;
          await existingChoice.save();

          // Mettre à jour les choix de l'autre étudiant
          const otherStudent = await Student.findById(existingChoice.student);
          if (otherStudent) {
            otherStudent.choices = otherStudent.choices.filter(
              (choiceId) =>
                choiceId.toString() !== existingChoice._id.toString()
            );
            await otherStudent.save();
          }

          // Retirer le sujet du binome de l'autre étudiant
          if (existingChoice.binome) {
            const binomeStudent = await Student.findById(existingChoice.binome);
            if (binomeStudent) {
              // Mettre à jour le choix du binome pour le même sujet
              const binomeChoice = await Choice.findOne({
                student: existingChoice.binome,
                subject: subjectId,
              });
              if (binomeChoice) {
                binomeChoice.valid = false;
                await binomeChoice.save();
              }

              binomeStudent.choices = binomeStudent.choices.filter(
                (choiceId) =>
                  choiceId.toString() !== binomeChoice._id.toString()
              );
              await binomeStudent.save();
            }
          }
          // Vérifier si le choix existe déjà pour l'étudiant
          let studentChoice = await Choice.findOne({ student: studentId });
          if (studentChoice) {
            // Mettre à jour le choix existant
            studentChoice.valid = true;
            await studentChoice.save();
          }
        }
      }
    }

    // Mettre à jour les choix de l'étudiant pour ne conserver que ceux avec valid: true
    student.choices = student.choices.filter((choice) => choice.valid);
    await student.save();

    res
      .status(200)
      .json({
        message: "Subject assigned to student successfully",
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

// Publier ou masquer l'affectation d'un sujet PFA
export const publishHidePFAChoice = async (req, res) => {
  try {
    const { response } = req.params;

    // Publier ou masquer l'affectation
    let updateResult;
    if (response === "publish") {
      updateResult = await Choice.updateMany({ valid: true }, { isAffectationVisible: true });
    } else if (response === "hide") {
      updateResult = await Choice.updateMany({ valid: false }, { isAffectationVisible: false });
    } else {
      return res.status(400).json({ message: "Invalid response parameter" });
    }

    console.log(`Update result: ${JSON.stringify(updateResult)}`);

    // Mettre à jour les choix des étudiants concernés
    const students = await Student.find().populate("choices");

    for (const student of students) {
      student.choices = student.choices.filter((choice) => choice.isAffectationVisible);
      await student.save();
    }
    await Choice.updateMany({}, { isFirstPublication: false });

    res.status(200).json({
      message: `Assignment ${response === "publish" ? "published" : "hidden"} successfully`,
    });
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const sendMailTo = async (req, res) => {
  try {
    // Vérifier si c'est la première publication
    const firstPublication = await Choice.findOne({ isFirstPublication: true });
    console.log("First publication:", firstPublication);
  
  
    res.status(200).json({ message: "Emails sent successfully" });

    // Appeler la fonction firstSend ou modifiedSend après avoir envoyé la réponse
    if (!firstPublication) {
      await Choice.updateMany({}, { isFirstPublication: true });
      await firstSend();  
    } else {
      await modifiedSend();
    }

 
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

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
    console.log("Emails to send:", emails);

    if (emails.length === 0) {
      throw new Error("No recipients defined");
    }

    // Envoyer un email de confirmation avec un lien vers la liste des sujets
    const subject = "Publication des choix de sujets PFA";
    const html = `
      <p>Les choix ont été publiés !</p>
      <p>Vous pouvez les consulter </p>
    `;

    for (const email of emails) {
      await sendMail(email, subject, html); // Ensure sendEmail is correctly defined
    }

    console.log("Premier envoi effectué avec succès.");
  } catch (error) {
    console.error("Error during first send:", error);
  }
};

// Handle modified send option
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
    console.log("Emails to send:", emails);

    if (emails.length === 0) {
      throw new Error("No recipients defined");
    }

    const subject = "Modification à propos la publication des choix de sujets PFA";
    const html = `
      <p>Les choix ont été publiés de nouveau ! </p>
      <p>Vous pouvez les consulter </p>
    `;

    for (const email of emails) {
      await sendMail(email, subject, html); // Ensure sendEmail is correctly defined
    }

    console.log("Envoi modifié effectué avec succès.");
  } catch (error) {
    console.error("Error during modified send:", error);
  }
};

// Supprimer les choix de tous les étudiants
export const clearAllStudentChoices = async (req, res) => {
  try {
    // Mettre à jour tous les étudiants pour supprimer leurs choix
    await Student.updateMany({}, { $set: { choices: [] } });

    res
      .status(200)
      .json({ message: "All student choices have been cleared successfully" });
  } catch (error) {
    console.error("Error clearing student choices:", error);
    res.status(500).json({ message: error.message });
  }
};
