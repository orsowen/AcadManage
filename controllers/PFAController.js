import Subject_PFA from "../models/subject_pfa.js";
import Joi from "joi";

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
});
export const addDepositPeriod = async (req, res) => {
  try {
    console.log("req.body:", req.body); // Debugging

    // Validation des données de la requête
    const { error } = depositValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { start_deposit, end_deposit } = req.body;

    // Vérifier s'il existe déjà des dates de dépôt
    const existingPeriods = await Subject_PFA.find({
      start_deposit: { $exists: true },
      end_deposit: { $exists: true },
    });

    if (existingPeriods.length > 0) {
      return res.status(400).json({
        message:
          "Des périodes de dépôt existent déjà. Veuillez les supprimer avant d'en ajouter de nouvelles.",
        existingPeriods,
      });
    }

    // Mise à jour des champs `start_deposit` et `end_deposit` pour tous les documents
    const updatedDocuments = await Subject_PFA.updateMany(
      {}, // Filtre : applique la mise à jour à tous les documents
      {
        $set: {
          start_deposit,
          end_deposit,
        },
      }
    );

    if (updatedDocuments.modifiedCount === 0) {
      return res.status(404).json({
        message: "Aucun document n'a été mis à jour.",
      });
    }

    res.status(200).json({
      message: "Les périodes de dépôt ont été mises à jour avec succès.",
      data: updatedDocuments,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des périodes de dépôt :",
      error
    );
    res.status(500).json({ message: "Erreur de serveur" });
  }
};
