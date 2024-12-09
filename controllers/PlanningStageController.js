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
        res.status(201).json({
            message: "Created Successfully",
            savedPlanningStage
        });
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
    const skip = (page - 1) * limit;
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

        // Fetch Planning Stages with the provided filters, pagination, and population
        const planningStages = await PlanningStage.find(filter)
            .populate({
                path: 'internship', // Populate internship field
                select: 'title topic student teacher', // Select specific fields from internship
                populate: [
                    {
                        path: 'student', // Populate student inside internship
                        select: 'firstName lastName', // Fetch these fields from student
                        populate: {
                            path: 'user', // Populate user to fetch email
                            select: 'email', // Select only email from user
                        },
                    },
                    {
                        path: 'teacher', // Populate teacher inside internship
                        select: 'firstName lastName', // Fetch these fields from teacher
                        populate: {
                            path: 'user', // Populate user to fetch email
                            select: 'email', // Select only email from user
                        },
                    },
                ],
            }) // Populate internship, student, and teacher details
            .skip(skip) // Skip results for previous pages
            .limit(Number(limit)); // Limit the results to the specified number
        // Fetch the total count of filtered Planning Stages
        const total = await PlanningStage.countDocuments(filter);

        res.status(200).json({
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            data: planningStages,
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
                        select: 'firstName lastName', // Fetch these fields from student
                        populate: {
                            path: 'user', // Populate user to fetch email
                            select: 'email', // Select only email from user
                        },
                    },
                    {
                        path: 'teacher', // Populate teacher inside internship
                        select: 'firstName lastName', // Fetch these fields from teacher
                        populate: {
                            path: 'user', // Populate user to fetch email
                            select: 'email', // Select only email from user
                        },
                    },
                ],
            }) // Populate internship, student, and teacher details
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


// Update the isPublished status for all non-archived planning stages
// export const updatePublicationStatus = async (req, res) => {
//     const { type, response } = req.params;

//     // Validate response parameter
//     if (response !== "true" && response !== "false") {
//         return res.status(400).json({ message: "'response' parameter must be 'true' or 'false'." });
//     }

//     const publish = response === "true"; // Convert response to boolean

//     try {
//         // Update all non-archived PlanningStage objects
//         const result = await PlanningStage.updateMany(
//             { isArchived: false }, // Condition: not archived
//             { isPublished: publish } // Update: set isPublished based on the 'publish' value
//         );

//         res.status(200).json({
//             message: `Planning stages for ${type} successfully ${publish ? "published" : "hidden"}.`,
//             updatedCount: result.modifiedCount, // Number of documents updated
//         });
//     } catch (error) {
//         console.error("Error updating publication status:", error.message);
//         res.status(500).json({ error: "Failed to update publication status." });
//     }
// };
// Update the isPublished status for all non-archived planning stages
export const updatePublicationStatus = async (req, res) => {
    const { response } = req.params; // Extract  'response' from the route parameters

    // Validate the `response` parameter
    if (response !== "true" && response !== "false") {
        return res.status(400).json({ message: "'response' parameter must be 'true' or 'false'." });
    }

    const isPublish = response === "true"; // Convert response to a boolean

    try {
        // Update all non-archived PlanningStage objects
        const result = await PlanningStage.updateMany(
            { isArchived: false }, // Condition: not archived
            { isPublished: isPublish } // Update: set isPublished to true/false based on the response
        );

        res.status(200).json({
            message: `Planning stages successfully ${isPublish ? "published" : "hidden"}.`,
            updatedCount: result.modifiedCount, // Number of documents updated
        });
    } catch (error) {
        console.error("Error updating planning stages:", error.message);
        res.status(500).json({ error: "Failed to update publication status." });
    }
};