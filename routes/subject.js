import express from 'express';
import { addSubject, getAllSubjects, getSubjectById } from '../controllers/subject.js';
//import { isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/',  addSubject);
router.get('/',  getAllSubjects);
router.get('/:id', getSubjectById);


export default router;
