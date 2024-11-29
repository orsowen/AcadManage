// controllers/topic.controller.js

import Topic from '../models/Topic.js';

// Create a new topic
export const createTopic = async (req, res) => {
    const { title, description, techList } = req.body;

    try {
        const newTopic = new Topic({ title, description, techList });
        const savedTopic = await newTopic.save();
        res.status(201).json(savedTopic);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création du sujet.' });
    }
};

// Get all topics
export const getTopics = async (req, res) => {
    try {
        const topics = await Topic.find();
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des sujets.' });
    }
};

// Get a single topic by ID
export const getTopicById = async (req, res) => {
    const { id } = req.params;

    try {
        const topic = await Topic.findById(id);
        if (!topic) {
            return res.status(404).json({ error: 'Sujet non trouvé.' });
        }
        res.status(200).json(topic);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du sujet.' });
    }
};

// Update a topic
export const updateTopic = async (req, res) => {
    const { id } = req.params;
    const { title, description, techList } = req.body;

    try {
        const updatedTopic = await Topic.findByIdAndUpdate(id, { title, description, techList }, { new: true });
        if (!updatedTopic) {
            return res.status(404).json({ error: 'Sujet non trouvé.' });
        }
        res.status(200).json(updatedTopic);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du sujet.' });
    }
};

// Delete a topic
export const deleteTopic = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTopic = await Topic.findByIdAndDelete(id);
        if (!deletedTopic) {
            return res.status(404).json({ error: 'Sujet non trouvé.' });
        }
        res.status(200).json({ message: 'Sujet supprimé avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression du sujet.' });
    }
};
