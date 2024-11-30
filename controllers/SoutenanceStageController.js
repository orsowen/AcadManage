import SoutenanceStage from '../models/SoutenanceStage.js';

// Create a new Soutenance Stage
export const createSoutenanceStage = async (req, res) => {
    const { horaire, day, meet_link, student, teacher } = req.body;

    try {
        const newSoutenanceStage = new SoutenanceStage({
            horaire,
            day,
            meet_link,
            student,
            teacher,
        });

        const savedSoutenanceStage = await newSoutenanceStage.save();
        res.status(201).json(savedSoutenanceStage);
    } catch (error) {
        console.error('Error creating soutenance stage:', error.message);
        res.status(500).json({ error: 'Failed to create soutenance stage.' });
    }
};

// Fetch all Soutenance Stages
export const getAllSoutenanceStages = async (req, res) => {
    try {
        const soutenanceStages = await SoutenanceStage.find().populate('student teacher');
        res.status(200).json(soutenanceStages);
    } catch (error) {
        console.error('Error fetching soutenance stages:', error.message);
        res.status(500).json({ error: 'Failed to fetch soutenance stages.' });
    }
};

// Fetch a single Soutenance Stage by ID
export const getSoutenanceStageById = async (req, res) => {
    const { id } = req.params;

    try {
        const soutenanceStage = await SoutenanceStage.findById(id).populate('student teacher');
        if (!soutenanceStage) {
            return res.status(404).json({ message: 'Soutenance Stage not found.' });
        }
        res.status(200).json(soutenanceStage);
    } catch (error) {
        console.error('Error fetching soutenance stage:', error.message);
        res.status(500).json({ error: 'Failed to fetch soutenance stage.' });
    }
};

// Update a Soutenance Stage
export const updateSoutenanceStage = async (req, res) => {
    const { id } = req.params;
    const { horaire, day, meet_link, student, teacher } = req.body;

    try {
        const updatedSoutenanceStage = await SoutenanceStage.findByIdAndUpdate(
            id,
            { horaire, day, meet_link, student, teacher },
            { new: true, runValidators: true }
        );
        if (!updatedSoutenanceStage) {
            return res.status(404).json({ message: 'Soutenance Stage not found.' });
        }
        res.status(200).json(updatedSoutenanceStage);
    } catch (error) {
        console.error('Error updating soutenance stage:', error.message);
        res.status(500).json({ error: 'Failed to update soutenance stage.' });
    }
};

// Delete a Soutenance Stage
export const deleteSoutenanceStage = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedSoutenanceStage = await SoutenanceStage.findByIdAndDelete(id);
        if (!deletedSoutenanceStage) {
            return res.status(404).json({ message: 'Soutenance Stage not found.' });
        }
        res.status(200).json({ message: 'Soutenance Stage deleted successfully.' });
    } catch (error) {
        console.error('Error deleting soutenance stage:', error.message);
        res.status(500).json({ error: 'Failed to delete soutenance stage.' });
    }
};