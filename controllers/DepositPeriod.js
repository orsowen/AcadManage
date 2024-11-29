import DepositPeriod from "../models/DepositPeriod.js";
import Joi from "joi";

// Validation des données de la requête avec Joi
const depositValidationSchema = Joi.object({
  start_deposit: Joi.date().required().messages({
    "any.required": "La date de début est requise.",
  }),
  end_deposit: Joi.date()
    .greater(Joi.ref("start_deposit"))
    .required()
    .messages({
      "date.greater": "La date de fin doit être supérieure à la date de début.",
      "any.required": "La date de fin est requise.",
    }),
  for: Joi.string().valid("PFA", "PFE", "STAGE").required().messages({
    "any.required": "Le choix est requis.",
    "any.only": "Le choix doit être l'un des suivants : PFA, PFE, STAGE.",
  }),
});

export const addDepositPeriod = async (req, res) => {
  try {
    console.log("req.body:", req.body); // Debugging

    // Validation des données de la requête
    const { error } = depositValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { start_deposit, end_deposit, for: forChoice } = req.body;

    // Vérifier si une période de dépôt existe déjà pour ce choix
    const existingPeriod = await DepositPeriod.findOne({ For: forChoice });

    if (existingPeriod) {
      return res.status(400).json({
        message: `Une période de dépôt pour ${forChoice} existe déjà. Veuillez la supprimer avant d'en ajouter une nouvelle.`,
        existingPeriod,
      });
    }

    // Vérifier s'il existe une période de dépôt qui chevauche les dates spécifiées
    const existingDatePeriod = await DepositPeriod.findOne({
      $or: [
        {
          Start_Date: { $lt: end_deposit },
          End_Date: { $gt: start_deposit },
        },
      ],
    });

    if (existingDatePeriod) {
      return res.status(400).json({
        message:
          "Les dates de dépôt se chevauchent avec une période existante.",
        existingDatePeriod,
      });
    }

    // Création d'une nouvelle période de dépôt
    const newDepositPeriod = new DepositPeriod({
      Start_Date: start_deposit,
      End_Date: end_deposit,
      For: forChoice,
    });

    // Enregistrement de la nouvelle période de dépôt
    await newDepositPeriod.save();

    res.status(201).json({
      message: "Période de dépôt ajoutée avec succès.",
      data: newDepositPeriod,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la période de dépôt :", error);
    res.status(500).json({ message: "Erreur de serveur" });
  }
};
