
import Teacher from '../models/Teachers.js';
import Topic from '../models/Topic.js';

// Create a new topic
export const createTopic = async (req, res) => {
    const { title, description, techList, teacher } = req.body;

    try {
        const newTopic = new Topic({ title, description, techList, teacher });
        const savedTopic = await newTopic.save();
        res.status(201).json(savedTopic);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création du sujet.', error });
    }
};


export const getTopics = async (req, res) => {
    const { page = 1, limit = 5, title, techList } = req.query; // Default to page 1 with 5 results per page

    try {
        // Build the filter object
        let filter = {};
        if (title) filter.title = { $regex: title, $options: 'i' }; // Case-insensitive match for title
        if (techList) filter.techList = { $in: techList.split(',') }; // Filter by techList (comma-separated list)

        // Fetch topics with filters, pagination, and populate the teacher field
        const topics = await Topic.find(filter)
            .populate('teacher', 'firstName lastName email') // Populate teacher details
            .skip((page - 1) * limit) // Skip results for previous pages
            .limit(Number(limit)); // Limit results to the specified number

        // Get the total count of filtered topics
        const total = await Topic.countDocuments(filter);

        res.status(200).json({
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            data: topics,
        });
    } catch (error) {
        console.error('Error fetching topics:', error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération des sujets.' });
    }
};

// Get a single topic by ID
export const getTopicById = async (req, res) => {
    const { id } = req.params;

    try {
        const topic = await Topic.findById(id)
            .populate('teacher', 'firstName lastName email') // Populate teacher details;
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


// MANUAL ADDING
export const addTeacherToTopic = async (req, res) => {
    try {
        const { topicId, teacherId } = req.body;

        // Fetch the topic and teacher
        const topic = await Topic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found.' });
        }

        // Check if the topic already has an assigned teacher
        if (topic.teacher) {
            return res.status(400).json({ message: 'This topic already has an assigned teacher.' });
        }

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }
        if (teacher.subjectCount === teacher.assignedTopics.length) {
            return res.status(404).json({ message: 'Teacher assignment is full' });
        }

        // Assign the teacher to the topic
        topic.teacher = teacherId;
        await topic.save();

        // Add the topic to the teacher's assignedTopics array
        teacher.assignedTopics.push(topicId);
        await teacher.save();

        res.status(200).json({ message: 'Teacher successfully assigned to topic.', teacher, topic });
    } catch (error) {
        console.error('Error assigning teacher to topic:', error.message);
        res.status(500).json({ error: 'Failed to assign teacher to topic.' });
    }
};



// assign Teacher to Topics automatically
export const assignTeachersToTopics = async (req, res) => {
    const { teacherIds } = req.body; // Teacher IDs provided in the request body (optional)

    try {
        // Step 1: Fetch the teachers - either provided in teacherIds or all teachers
        let teachers;
        if (teacherIds && teacherIds.length > 0) {
            teachers = await Teacher.find({
                _id: { $in: teacherIds },
                $or: [
                    { assignedTopics: { $size: 0 } },  // Teachers with no assigned topics
                    { $expr: { $lt: [{ $size: "$assignedTopics" }, "$subjectCount"] } }  // Teachers with assigned topics less than their subject count
                ]
            });
        } else {
            // Fetch all teachers with no assigned topics or less assigned topics than their subject count
            teachers = await Teacher.find({
                $or: [
                    { assignedTopics: { $size: 0 } }, // Teachers with no assigned topics
                    { $expr: { $lt: [{ $size: "$assignedTopics" }, "$subjectCount"] } } // Teachers with assigned topics less than their subject count
                ]
            });
        }

        // Step 2: Fetch all topics with no assigned teacher
        const topics = await Topic.find({ teacher: null });

        if (teachers.length === 0 || topics.length === 0) {
            return res.status(400).json({ message: 'No teachers or unassigned topics available.' });
        }

        // Step 3: Calculate total subjects across all teachers and total topics
        const totalSubjects = teachers.reduce((sum, teacher) => sum + teacher.subjectCount, 0);
        const totalTopics = topics.length;

        if (totalSubjects === 0) {
            return res.status(400).json({ message: 'Total subject count is zero, cannot assign topics.' });
        }

        // Step 4: Assign topics to teachers based on subjectCount
        let topicIndex = 0;
        // ADDED FOR TESTING
        let teachersArray = [];
        let topicsArray = [];
        for (const teacher of teachers) {
            // Determine how many topics to assign based on the subjectCount
            const availableTopicCount = Math.min(teacher.subjectCount - teacher.assignedTopics.length, totalTopics - topicIndex);

            // Assign the topics to the teacher
            for (let i = 0; i < availableTopicCount && topicIndex < totalTopics; i++) {
                const topic = topics[topicIndex];

                // Assign the teacher to the topic
                topic.teacher = teacher._id;
                await topic.save();

                // ADDED FOR TESTING
                topicsArray.push(topic);
                // Add the topic to the teacher's assignedTopics array
                teacher.assignedTopics.push(topic._id);

                await teacher.save();

                topicIndex++;
            }

            // ADDED FOR TESTING
            teachersArray.push(teacher);
            // If all topics are assigned, break out of the loop
            if (topicIndex >= totalTopics) break;
        }

        res.status(200).json({ message: 'Topics successfully assigned to teachers.', teachersArray, topicsArray });
    } catch (error) {
        console.error('Error assigning topics to teachers:', error.message);
        res.status(500).json({ error: 'Failed to assign topics to teachers.' });
    }
};

// JUST FOR DEVELOPMENT USE ONLY
export const removeAllAssignedTopics = async (req, res) => {
    try {
        // Step 1: Fetch all teachers
        const teachers = await Teacher.find();

        // Step 2: Remove all assigned topics from teachers
        for (const teacher of teachers) {
            teacher.assignedTopics = [];  // Clear the assignedTopics array
            await teacher.save();  // Save the teacher document
        }

        // Step 3: Fetch all topics and set their teacher field to null
        const topics = await Topic.find();

        for (const topic of topics) {
            topic.teacher = null;  // Remove the teacher reference
            await topic.save();  // Save the topic document
        }

        res.status(200).json({ message: 'All assigned topics cleared for teachers and updated in topics.' });
    } catch (error) {
        console.error('Error removing assigned topics:', error.message);
        res.status(500).json({ error: 'Failed to remove assigned topics.' });
    }
};