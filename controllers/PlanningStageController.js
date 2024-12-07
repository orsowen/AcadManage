import PlanningStage from '../models/PlanningStage.js';

// Create a new Planning Stage
export const createPlanningStage = async (req, res) => {
    const { horaire, day, meet_link, internship } = req.body;

    try {
        const newPlanningStage = new PlanningStage({
            horaire,
            day,
            meet_link,
            internship,
        });

        const savedPlanningStage = await newPlanningStage.save();
        res.status(201).json(savedPlanningStage);
    } catch (error) {
        console.error('Error creating planning stage:', error.message);
        res.status(500).json({ error: 'Failed to create planning stage.' });
    }
};
export const getAllPlanningStages = async (req, res) => {
    const {
        page = 1,
        limit = 5,
        day,
        horaire,
        meet_link,
        startDate,
        endDate
    } = req.query; // Default to page 1 and 5 results per page

    try {
        // Build the filter object dynamically
        let filter = {};
        if (day) filter.day = new Date(day); // Filter by specific day
        if (horaire) filter.horaire = Number(horaire); // Filter by horaire
        if (meet_link) filter.meet_link = { $regex: meet_link, $options: 'i' }; // Case-insensitive match for meet_link

        // Range filters for day
        if (startDate || endDate) {
            filter.day = {};
            if (startDate) filter.day.$gte = new Date(startDate); // Day >= startDate
            if (endDate) filter.day.$lte = new Date(endDate); // Day <= endDate
        }

        // Fetch Planning Stages with filters, pagination, and population
        const PlanningStages = await PlanningStage.find(filter)
            .populate({
                path: 'internship', // Populate internship field
                select: 'title topic student teacher', // Select specific fields from internship
                populate: [
                    {
                        path: 'student', // Populate student inside internship
                        select: 'firstName lastName email', // Fetch these fields from student
                    },
                    {
                        path: 'teacher', // Populate teacher inside internship
                        select: 'firstName lastName email', // Fetch these fields from teacher
                    },
                ],
            })// Populate student details 
            .skip((page - 1) * limit) // Skip results for previous pages
            .limit(Number(limit)); // Limit the results to the specified number

        // Fetch the total count of filtered Planning Stages
        const total = await PlanningStage.countDocuments(filter);

        res.status(200).json({
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            data: PlanningStages,
        });
    } catch (error) {
        console.error('Error fetching planning stages:', error.message);
        res.status(500).json({ error: 'Failed to fetch planning stages.' });
    }
};

// Fetch a single Planning Stage by ID
export const getPlanningStageById = async (req, res) => {
    const { id } = req.params;

    try {
        const planningStage = await PlanningStage.findById(id)
            .populate({
                path: 'internship', // Populate internship field
                select: 'title topic student teacher', // Select specific fields from internship
                populate: [
                    {
                        path: 'student', // Populate student inside internship
                        select: 'firstName lastName email', // Fetch these fields from student
                    },
                    {
                        path: 'teacher', // Populate teacher inside internship
                        select: 'firstName lastName email', // Fetch these fields from teacher
                    },
                ],
            }); // Populate student details 
        if (!planningStage) {
            return res.status(404).json({ message: 'Planning Stage not found.' });
        }
        res.status(200).json(planningStage);
    } catch (error) {
        console.error('Error fetching planning stage:', error.message);
        res.status(500).json({ error: 'Failed to fetch planning stage.' });
    }
};

// Update a Planning Stage
export const updatePlanningStage = async (req, res) => {
    const { id } = req.params;
    const { horaire, day, meet_link, internship } = req.body;

    try {
        const updatedPlanningStage = await PlanningStage.findByIdAndUpdate(
            id,
            { horaire, day, meet_link, internship },
            { new: true, runValidators: true }
        );
        if (!updatedPlanningStage) {
            return res.status(404).json({ message: 'Planning Stage not found.' });
        }
        res.status(200).json(updatedPlanningStage);
    } catch (error) {
        console.error('Error updating planning stage:', error.message);
        res.status(500).json({ error: 'Failed to update planning stage.' });
    }
};

// Delete a Planning Stage
export const deletePlanningStage = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedPlanningStage = await PlanningStage.findByIdAndDelete(id);
        if (!deletedPlanningStage) {
            return res.status(404).json({ message: 'Planning Stage not found.' });
        }
        res.status(200).json({ message: 'Planning Stage deleted successfully.' });
    } catch (error) {
        console.error('Error deleting planning stage:', error.message);
        res.status(500).json({ error: 'Failed to delete planning stage.' });
    }
};