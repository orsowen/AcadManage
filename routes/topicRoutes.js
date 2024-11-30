
import express from 'express';
import {
    addTeacherToTopic,
    assignTeachersToTopics,
    createTopic,
    deleteTopic,
    getTopicById,
    getTopics,
    removeAllAssignedTopics,
    updateTopic
} from '../controllers/TopicController.js';


const router = express.Router();

// POST /topics - Create a new topic
router.post('/', createTopic);

// GET /topics - Get all topics
router.get('/', getTopics);

// GET /topics/:id - Get a single topic by ID
router.get('/:id', getTopicById);

// PATCH /topics/:id - Update a topic by ID
router.patch('/:id', updateTopic);

// DELETE /topics/:id - Delete a topic by ID
router.delete('/:id', deleteTopic);

// Assign teachers to topics
router.post('/assign-teachers', assignTeachersToTopics);
router.post('/assign-teacher-topic', addTeacherToTopic);
// FOR DEVELOPMENT USE ONLY
router.post('/remove-all-assigned', removeAllAssignedTopics);

export default router;
