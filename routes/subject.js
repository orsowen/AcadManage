import express from 'express';
import { addSubject, getAllSubjects, getSubjectById, updateSubject,  getAllSubjectsByTeacher, toggleSubjectPublish, updateAvancement} from '../controllers/subject.js';
import { isAdmin, isAdminOrTeacher, isTeacher } from '../middlewares/authentication.js';

const router = express.Router();

router.get('/mysubjects', isTeacher, getAllSubjectsByTeacher);

router.post('/', isAdmin, addSubject);
router.get('/', isAdminOrTeacher, getAllSubjects);
router.get('/:id', isAdmin, getSubjectById);
router.patch('/:id', isAdmin, updateSubject);
router.post('/publish/:response', isAdmin , toggleSubjectPublish);
router.patch("/:id/avancement", updateAvancement);

export default router;
