import express from 'express';
import { addSubject, getAllSubjects, getSubjectById, updateSubject} from '../controllers/subject.js';
//import { isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/',  addSubject);
router.get('/',  getAllSubjects);
router.get('/:id', getSubjectById);
router.patch('/:id', updateSubject);


export default router;
