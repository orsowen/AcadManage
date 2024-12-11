import express from "express";
import { addSkill, getSkills, getSkillById, updateSkill, deleteSkill } from "../controllers/skill.js";
import { isAdmin, isAdminOrTeacher } from "../middlewares/authentication.js";


const router = express.Router();

router.post('/', isAdmin, addSkill);
router.get('/', isAdminOrTeacher, getSkills);
router.get('/:id', isAdmin, getSkillById);
router.patch('/:id', isAdmin, updateSkill);
router.delete('/:id', isAdmin, deleteSkill);

export default router;