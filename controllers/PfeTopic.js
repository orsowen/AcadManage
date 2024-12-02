
import DepositPeriod from '../models/DepositPeriod.js';
import PFETopic from '../models/PFETopic.js';

export const createpfeTopic = async (req, res) => {
    const { title, description, Nom_societe, techList, teacher } = req.body;

    try {
        const newPfeTopic = new PFETopic({ title, description, Nom_societe, techList, teacher });
        const savedpfeTopic = await newPfeTopic.save();
        res.status(201).json(savedpfeTopic);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création du sujet.', error });
    }
};


export const updatepfeTopic = async (req, res) => {
    const { id } = req.params;
    const { title, description, Nom_societe, techList, teacher } = req.body;

    try {
        const currentPeriod = await DepositPeriod.findOne({
            For: "PFE",
            Start_Deposit: { $lte: new Date() },
            End_Deposit: { $gte: new Date() }
        });
        if (!currentPeriod) {
            return res.status(403).json({ error: "Les sujets PFE ne peuvent pas être modifiés pendant la période de dépôt." });
        }

        const updatedTopic = await PFETopic.findByIdAndUpdate(
            id,
            { title, description, Nom_societe, techList, teacher },
            { new: true, runValidators: true }
        );

        if (!updatedTopic) {
            return res.status(404).json({ error: "Sujet non trouvé." });
        }

        res.status(200).json(updatedTopic);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la mise à jour du sujet.", details: error.message });
    }
};