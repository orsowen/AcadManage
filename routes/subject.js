import express from 'express';
import { addSubject, getAllSubjects, getSubjectById, updateSubject, getAllSubjectsByTeacher, getAllSubjectsByStudent, toggleSubjectPublish, updateAvancement, proposeModification, validateModification } from '../controllers/subject.js';
import { isAdmin, isAdminOrTeacher, isTeacher, isStudent } from '../middlewares/authentication.js';

const router = express.Router();

router.get('/student/mysubjects', isStudent, getAllSubjectsByStudent);

router.get('/teacher/mysubjects', isTeacher, getAllSubjectsByTeacher);
router.patch("/:id/avancement", isTeacher, updateAvancement);
router.get('/student/mysubjects', isStudent, getAllSubjectsByStudent);

router.get('/teacher/mysubjects', isTeacher, getAllSubjectsByTeacher);
router.patch("/:id/avancement", isTeacher, updateAvancement);

router.post('/', isAdmin, addSubject);
router.get('/', isAdminOrTeacher, getAllSubjects);
router.get('/:id', isAdminOrTeacher, getSubjectById);
router.patch('/:id', isAdmin, updateSubject);
router.post('/publish/:response', isAdmin , toggleSubjectPublish);
router.patch('/:id/proposition', isTeacher, proposeModification);
router.get('/:id/validate', isAdmin, validateModification);

export default router;
