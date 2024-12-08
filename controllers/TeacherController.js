import Teacher from '../models/Teachers.js';

// Create a new teacher
export const createTeacher = async (req, res) => {
    const { lastName, firstName, cin, phone, subjectCount } = req.body;

    try {
        const newTeacher = new Teacher({ lastName, firstName, cin, phone, subjectCount });
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
    const { lastName, firstName, cin, phone, subjectCount } = req.body;

    try {
        // Fetch the existing teacher by ID
        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found.' });
        }

        // If the cin is different from the current one, check if the new cin already exists in the database
        if (cin !== teacher.cin) {
            const existingTeacher = await Teacher.findOne({ cin });
            if (existingTeacher && existingTeacher._id !== teacher._id) {
                return res.status(400).json({ error: 'Teacher with this CIN already exists.' });
            }
        }

        // Proceed to update the teacher's details
        teacher.lastName = lastName || teacher.lastName;
        teacher.firstName = firstName || teacher.firstName;
        teacher.cin = cin || teacher.cin;
        teacher.phone = phone || teacher.phone;
        teacher.subjectCount = subjectCount || teacher.subjectCount;

        const updatedTeacher = await teacher.save(); // Save the updated teacher document

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
