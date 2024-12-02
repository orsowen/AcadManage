
import express from 'express';
import { createpfeTopic, updatepfeTopic } from '../controllers/PfeTopic.js';


const router = express.Router();

router.post('/post', createpfeTopic);

router.patch('/:id', updatepfeTopic);

export default router;