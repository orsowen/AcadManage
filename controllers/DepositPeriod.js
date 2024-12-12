import Joi from "joi";
import DepositPeriod from "../models/DepositPeriod.js";

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
  For: Joi.string().valid("PFA", "PFE", "STAGE").required().messages({
    "any.required": "Le type de dépôt est requis.",
    "any.only": "Le type de dépôt doit être PFA, PFE ou STAGE.",
  }),
});

// **Ajouter une période de dépôt**

export const addDepositPeriod =
  (useUrl = true) =>
  async (req, res) => {
    try {
      const choix =
        useUrl == true ? req.baseUrl.replace("/", "").toUpperCase() : "STAGE"; // Extracts PFE, PFA, STAGE
      req.body.For = choix; // Injecting 'For' into request body

      // Validation des données
      const { error } = depositValidationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { Start_Deposit, End_Deposit, Start_Choice, End_Choice } = req.body;

      // Vérifier s'il existe déjà une période pour ce choix
      const existingPeriod = await DepositPeriod.findOne({ For: choix });
      if (existingPeriod) {
        return res.status(400).json({
          message: `Une période de dépôt pour ${choix} existe déjà. Veuillez la supprimer ou la modifier avant d'en ajouter une nouvelle.`,
        });
      }

      // Création d'une nouvelle période de dépôt
      const newDepositPeriod = new DepositPeriod({
        Start_Deposit,
        End_Deposit,
        Start_Choice,
        End_Choice,
        For: choix,
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
export const getDepositPeriods = async (req, res) => {
  try {
    const choix = req.baseUrl.replace("/", "").toUpperCase();
    const Period = await DepositPeriod.findOne({ For: choix });

    res.status(200).json(Period);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des périodes de dépôt :",
      error
    );
    res.status(500).json({ message: "Erreur de serveur." });
  }
};

// **Modifier une période de dépôt en fonction du type (PFE, PFA, STAGE)**
export const updateDepositPeriod = async (req, res) => {
  try {
    const choix = req.baseUrl.replace("/", "").toUpperCase();
    req.body.For = choix;
    const { Start_Deposit, End_Deposit, Start_Choice, End_Choice } = req.body;

    // Validate the input data

    const { error } = depositValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if 'For' is one of the accepted values
    const validForValues = ["PFE", "PFA", "STAGE"];
    if (!validForValues.includes(choix)) {
      return res
        .status(400)
        .json({ message: "Type 'For' invalide. Utilisez PFE, PFA ou STAGE." });
    }

    // Update deposit period based on 'For'
    const updatedPeriod = await DepositPeriod.findOneAndUpdate(
      { For: choix },
      { Start_Deposit, End_Deposit, Start_Choice, End_Choice },
      { new: true }
    );
    if (!updatedPeriod) {
      return res
        .status(404)
        .json({ message: `Aucune période trouvée pour ${choix}.` });
    }

    res.status(200).json({
      message: `Période de dépôt pour ${choix} mise à jour avec succès.`,
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
