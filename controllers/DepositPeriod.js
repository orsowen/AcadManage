import DepositPeriod from "../models/DepositPeriod.js";
import Joi from "joi";

// Schéma de validation avec Joi
const depositValidationSchema = Joi.object({
  Start_Deposit: Joi.date().required().messages({
    "any.required": "La date de début de dépôt est requise.",
  }),
  End_Deposit: Joi.date()
    .greater(Joi.ref("Start_Deposit"))
    .required()
    .messages({
      "date.greater":
        "La date de fin de dépôt doit être supérieure à la date de début.",
      "any.required": "La date de fin de dépôt est requise.",
    }),
  Start_Choice: Joi.date().when("For", {
    is: "PFA",
    then: Joi.required().messages({
      "any.required": "La date de début de choix est requise pour PFA.",
    }),
    otherwise: Joi.forbidden().messages({
      "any.unknown":
        "La date de début de choix ne doit pas être remplie pour PFE ou STAGE.",
    }),
  }),
  End_Choice: Joi.date()
    .greater(Joi.ref("Start_Choice"))
    .when("For", {
      is: "PFA",
      then: Joi.required().messages({
        "date.greater":
          "La date de fin de choix doit être supérieure à la date de début de choix pour PFA.",
        "any.required": "La date de fin de choix est requise pour PFA.",
      }),
      otherwise: Joi.forbidden().messages({
        "any.unknown":
          "La date de fin de choix ne doit pas être remplie pour PFE ou STAGE.",
      }),
    }),
  For: Joi.string().valid("PFA", "PFE", "STAGE").required().messages({
    "any.required": "Le choix est requis.",
    "any.only": "Le choix doit être l'un des suivants : PFA, PFE, STAGE.",
  }),
});

// **Ajouter une période de dépôt**
export const addDepositPeriod = async (req, res) => {
  try {
    console.log("req.body:", req.body); // Debugging

    // Validation des données
    const { error } = depositValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { Start_Deposit, End_Deposit, Start_Choice, End_Choice, For } =
      req.body;

    // Vérifier s'il existe déjà une période pour ce choix
    const existingPeriod = await DepositPeriod.findOne({ For });
    if (existingPeriod) {
      return res.status(400).json({
        message: `Une période de dépôt pour ${For} existe déjà. Veuillez la supprimer ou la modifier avant d'en ajouter une nouvelle.`,
      });
    }

    // Création d'une nouvelle période de dépôt
    const newDepositPeriod = new DepositPeriod({
      Start_Deposit,
      End_Deposit,
      Start_Choice,
      End_Choice,
      For,
    });

    // Sauvegarde dans la base de données
    await newDepositPeriod.save();

    res.status(201).json({
      message: "Période de dépôt ajoutée avec succès.",
      data: newDepositPeriod,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la période de dépôt :", error);
    res.status(500).json({ message: "Erreur de serveur." });
  }
};

// **Récupérer toutes les périodes de dépôt**
export const getAllDepositPeriods = async (req, res) => {
  try {
    const periods = await DepositPeriod.find();
    res.status(200).json(periods);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des périodes de dépôt :",
      error
    );
    res.status(500).json({ message: "Erreur de serveur." });
  }
};

// **Récupérer une période de dépôt par ID**
export const getDepositPeriodById = async (req, res) => {
  try {
    const { id } = req.params;
    const period = await DepositPeriod.findById(id);

    if (!period) {
      return res.status(404).json({ message: "Période de dépôt non trouvée." });
    }

    res.status(200).json(period);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la période de dépôt :",
      error
    );
    res.status(500).json({ message: "Erreur de serveur." });
  }
};

// **Modifier une période de dépôt**
export const updateDepositPeriod = async (req, res) => {
  try {
    const { id } = req.params;

    // Validation des données
    const { error } = depositValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { Start_Deposit, End_Deposit, Start_Choice, End_Choice, For } =
      req.body;

    // Mise à jour de la période de dépôt
    const updatedPeriod = await DepositPeriod.findByIdAndUpdate(
      id,
      { Start_Deposit, End_Deposit, Start_Choice, End_Choice, For },
      { new: true }
    );

    if (!updatedPeriod) {
      return res.status(404).json({ message: "Période de dépôt non trouvée." });
    }

    res.status(200).json({
      message: "Période de dépôt mise à jour avec succès.",
      data: updatedPeriod,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la période de dépôt :",
      error
    );
    res.status(500).json({ message: "Erreur de serveur." });
  }
};
