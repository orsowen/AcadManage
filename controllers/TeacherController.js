import Teacher from '../models/Teachers.js';

// Create a new teacher
export const createTeacher = async (req, res) => {
    const { lastName, firstName, cin, email, phone, subjectCount } = req.body;

    try {
        const newTeacher = new Teacher({ lastName, firstName, cin, email, phone, subjectCount });
        const savedTeacher = await newTeacher.save();
        res.status(201).json(savedTeacher);
    } catch (error) {
        console.error('Error creating teacher:', error.message);
        res.status(400).json({ error: 'Error creating teacher. ' + error.message });
    }
};

// Get all teachers
export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json(teachers);
    } catch (error) {
        console.error('Error fetching teachers:', error.message);
        res.status(500).json({ error: 'Error fetching teachers.' });
    }
};

// Get a single teacher by ID
export const getTeacherById = async (req, res) => {
    const { id } = req.params;

    try {
        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found.' });
        }
        res.status(200).json(teacher);
    } catch (error) {
        console.error('Error fetching teacher:', error.message);
        res.status(500).json({ error: 'Error fetching teacher.' });
    }
};

// Update a teacher
export const updateTeacher = async (req, res) => {
    const { id } = req.params;
    const { lastName, firstName, cin, email, phone, subjectCount } = req.body;

    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            id,
            { lastName, firstName, cin, email, phone, subjectCount },
            { new: true, runValidators: true } // Return the updated document and validate inputs
        );
        if (!updatedTeacher) {
            return res.status(404).json({ error: 'Teacher not found.' });
        }
        res.status(200).json(updatedTeacher);
    } catch (error) {
        console.error('Error updating teacher:', error.message);
        res.status(400).json({ error: 'Error updating teacher. ' + error.message });
    }
};

// Delete a teacher
export const deleteTeacher = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(id);
        if (!deletedTeacher) {
            return res.status(404).json({ error: 'Teacher not found.' });
        }
        res.status(200).json({ message: 'Teacher deleted successfully.' });
    } catch (error) {
        console.error('Error deleting teacher:', error.message);
        res.status(500).json({ error: 'Error deleting teacher.' });
    }
};
