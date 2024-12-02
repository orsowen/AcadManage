
import PfeTopic from '../models/Topic.js';

export const createpfeTopic = async (req, res) => {
    const { title, description, techList, teacher } = req.body;

    try {
        const newPfeTopic = new PfeTopic({ title, description, techList, teacher });
        const savedpfeTopic = await newPfeTopic.save();
        res.status(201).json(savedpfeTopic);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création du sujet.', error });
    }
};


