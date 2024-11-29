import express from "express";
import { addSkill, getSkills, getSkillById, updateSkill, deleteSkill } from "../controllers/skill.js";

//import {isAdmin} from "../middlewares/auth.js";

const router = express.Router();

router.post('/', addSkill);
router.get('/', getSkills);
router.get('/:id', getSkillById);
router.patch('/:id', updateSkill);
router.delete('/:id', deleteSkill);

export default router;