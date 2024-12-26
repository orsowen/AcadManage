import express from 'express';
import { addSubject, getAllSubjects, getSubjectById, updateSubject, getAllSubjectsByTeacher, getAllSubjectsByStudent, assignTeacherToSubject, toggleSubjectPublish, assignStudentToSubject , updateAvancement} from '../controllers/subject.js';
import { isAdmin, isAdminOrTeacher, isTeacher, isStudent } from '../middlewares/authentication.js';

const router = express.Router();

router.get('/student/mysubjects', isStudent, getAllSubjectsByStudent);

router.get('/teacher/mysubjects', isTeacher, getAllSubjectsByTeacher);
router.patch("/:id/avancement", isTeacher, updateAvancement);

router.post('/', isAdmin, addSubject);
router.get('/', isAdminOrTeacher, getAllSubjects);
router.get('/:id', isAdmin, getSubjectById);
router.patch('/:id', isAdmin, updateSubject);
router.post('/publish/:response', isAdmin , toggleSubjectPublish);
router.put("/assign-teacher-to-subject", isAdmin ,assignTeacherToSubject);
router.put("/assign-student-to-subject", isAdmin ,assignStudentToSubject);


export default router;
