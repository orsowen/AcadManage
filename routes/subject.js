import express from 'express';
import { addSubject, getAllSubjects, getSubjectById, updateSubject, getAllSubjectsByTeacher, assignTeacherToSubject ,toggleSubjectPublish, updateAvancement} from '../controllers/subject.js';
import { isAdmin, isAdminOrTeacher, isTeacher } from '../middlewares/authentication.js';

const router = express.Router();

router.get('/mysubjects', isTeacher, getAllSubjectsByTeacher);
router.patch("/:id/avancement", isTeacher, updateAvancement);

router.post('/', isAdmin, addSubject);
router.get('/', isAdminOrTeacher, getAllSubjects);
router.get('/:id', isAdmin, getSubjectById);
router.patch('/:id', isAdmin, updateSubject);
router.post('/publish/:response', isAdmin , toggleSubjectPublish);
router.put("/assign-teacher-to-subject", isAdmin ,assignTeacherToSubject);

export default router;
