import Student from '../models/Student.js';

// Create a new student
export const createStudent = async (req, res) => {
    const {
        lastName, firstName, cin, email, phone, arabicLastName, arabicFirstName,
        birthDate, governorate, gender, city, postalCode, nationality, bac,
        grade, isPrepa, university, etablissement, speciality, licenseYear,
        M1university, M1Etablissement, M1speciality, M1Year, M1Type, cFil, scoreG,
        bacYear, address
    } = req.body;

    try {
        const newStudent = new Student({
            lastName,
            firstName,
            cin,
            email,
            phone,
            arabicLastName,
            arabicFirstName,
            birthDate,
            governorate,
            gender,
            city,
            postalCode,
            nationality,
            bac,
            grade,
            isPrepa,
            university,
            etablissement,
            speciality,
            licenseYear,
            M1university,
            M1Etablissement,
            M1speciality,
            M1Year,
            M1Type,
            cFil,
            scoreG,
            bacYear,
            address
        });

        const savedStudent = await newStudent.save();
        res.status(201).json({ message: 'created successfully.', savedStudent });
    } catch (error) {
        console.error('Error creating student:', error.message);
        res.status(500).json({ error: 'Failed to create student.', error });
    }
};

// Fetch all students
export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error.message);
        res.status(500).json({ error: 'Failed to fetch students.' });
    }
};

// Fetch a student by ID
export const getStudentById = async (req, res) => {
    const { id } = req.params;

    try {
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student by ID:', error.message);
        res.status(500).json({ error: 'Failed to fetch student.' });
    }
};

// Update a student by ID
export const updateStudent = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const updatedStudent = await Student.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.status(200).json(updatedStudent);
    } catch (error) {
        console.error('Error updating student:', error.message);
        res.status(500).json({ error: 'Failed to update student.' });
    }
};

// Delete a student by ID
export const deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.status(200).json({ message: 'Student deleted successfully.' });
    } catch (error) {
        console.error('Error deleting student:', error.message);
        res.status(500).json({ error: 'Failed to delete student.' });
    }
};
