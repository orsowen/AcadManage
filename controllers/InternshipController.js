// controllers/internship.controller.js

import Internship from '../models/Internship.js';
import Topic from '../models/Topic.js';


// Add a new internship
export const addInternship = async (req, res) => {
    const { title, documents, StartDate, EndDate, isValid, topicId } = req.body;

    // Validate dates
    if (new Date(StartDate) > new Date(EndDate)) {
        return res.status(400).json({ error: "La date de début doit être antérieure à la date de fin." });
    }

    // Validate topicId
    if (!topicId) {
        return res.status(400).json({ error: "Le topicId est requis." });
    }

    try {
        // Check if the topic exists
        const topic = await Topic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ error: "Le topic associé n'existe pas." });
        }

        // Create the internship
        const newInternship = new Internship({ title, documents, StartDate, EndDate, isValid, topic: topicId });

        const savedInternship = await newInternship.save();

        res.status(201).json(savedInternship);
    } catch (error) {
        console.error("Error adding internship:", error.message);
        res.status(500).json({ error: "Erreur lors de l'ajout du stage." });
    }
};
// Get all internships
export const getInternships = async (req, res) => {
    try {
        const internships = await Internship.find();
        res.status(200).json(internships);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des stages." });
    }
};
