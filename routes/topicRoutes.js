
import express from 'express';
import {
    createTopic,
    deleteTopic,
    getTopicById,
    getTopics,
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

export default router;
