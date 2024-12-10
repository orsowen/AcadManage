import Skill from "../models/Skill.js"; 
import Subject from "../models/Subject.js"; 

// Ajouter une compétence
export const addSkill = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newSkill = new Skill({ name, description });
        await newSkill.save();
        res.status(201).json({ message: "Skill added successfully", skill: newSkill });
    } catch (error) {
        res.status(500).json({ message: "Error adding skill", error: error.message });
    }
};

// Lister toutes les compétences et leurs matières associées
export const getSkills = async (req, res) => {
    try {
        const Skills = await Skill.find();
        res.status(200).json({
            success: true,
            data: Skills
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Récupérer une compétence par ID
export const getSkillById = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);  // Récupérer la compétence par ID
        // const skill = await Skill.findById(req.params.id).populate("associatedSubjects"); 
        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }
        res.status(200).json(skill);
    } catch (error) {
        res.status(500).json({ message: "Error fetching skill", error: error.message });
    }
};

// Modifier une compétence
export const updateSkill = async (req, res) => {
    try {
        const { name, description, force } = req.body;
        const skill = await Skill.findById(req.params.id);
        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        // Vérifier les matières associées si assignée à une matière (avertir l'admin)
        if (!force) //force = false
            {
            const associatedSubjects = await Subject.find({ skill: skill._id });
            if (associatedSubjects.length > 0) {
                return res.status(400).json({
                    message: "Cannot update skill. It's linked to subjects."
                });
            }
        }

        skill.name = name || skill.name;
        skill.description = description || skill.description;
        await skill.save();

        res.status(200).json({ message: "Skill updated successfully", skill });
    } catch (error) {
        res.status(500).json({ message: "Error updating skill", error: error.message });
    }
};

// Supprimer  une compétence
export const deleteSkill = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        // Vérifier si des matières sont associées
        const associatedSubjects = await Subject.find({ skill: skill._id });
        if (associatedSubjects.length > 0) {
            // Archiver au lieu de supprimer
            skill.archived = true;
            await skill.save();
            return res.status(200).json({
                message: "Skill archived successfully because it's linked to subjects",
                skill
            });
        }

        await Skill.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Skill deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting skill", error: error.message });
    }
};
