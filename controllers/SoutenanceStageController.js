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
export const getAllSoutenanceStages = async (req, res) => {
    const {
        page = 1,
        limit = 5,
        studentId,
        teacherId,
        day,
        horaire,
        meet_link,
        startDate,
        endDate
    } = req.query; // Default to page 1 and 5 results per page

    try {
        // Build the filter object dynamically
        let filter = {};
        if (studentId) filter.student = studentId; // Filter by student
        if (teacherId) filter.teacher = teacherId; // Filter by teacher
        if (day) filter.day = new Date(day); // Filter by specific day
        if (horaire) filter.horaire = Number(horaire); // Filter by horaire
        if (meet_link) filter.meet_link = { $regex: meet_link, $options: 'i' }; // Case-insensitive match for meet_link

        // Range filters for day
        if (startDate || endDate) {
            filter.day = {};
            if (startDate) filter.day.$gte = new Date(startDate); // Day >= startDate
            if (endDate) filter.day.$lte = new Date(endDate); // Day <= endDate
        }

        // Fetch Soutenance Stages with filters, pagination, and population
        const soutenanceStages = await SoutenanceStage.find(filter)
            .populate('student', 'firstName lastName email') // Populate student details
            .populate('teacher', 'firstName lastName email') // Populate teacher details
            .skip((page - 1) * limit) // Skip results for previous pages
            .limit(Number(limit)); // Limit the results to the specified number

        // Fetch the total count of filtered Soutenance Stages
        const total = await SoutenanceStage.countDocuments(filter);

        res.status(200).json({
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            data: soutenanceStages,
        });
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