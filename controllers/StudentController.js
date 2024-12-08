import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { generateRandomPassword } from './UserController.js';
// Create a new student
export const createStudent = async (req, res) => {
    const {
        lastName, firstName, cin, email, phone, arabicLastName, arabicFirstName,
        birthDate, governorate, gender, city, postalCode, nationality, bac,
        grade, isPrepa, university, etablissement, speciality, licenseYear,
        M1university, M1Etablissement, M1speciality, M1Year, M1Type, cFil, scoreG,
        bacYear, address
    } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check for duplicate CIN, email, or phone in the User collection
        const existingUser = await User.findOne(
            { $or: [{ cin }, { email }, { phone }] },
            null,
            { session }
        );
        if (existingUser) {
            // console.log(existingUser);

            const field = existingUser.phone === phone ? 'Phone' : existingUser.email === email ? 'Email' : 'CIN';
            throw new Error(`${field} is already in use.`);
        }

        // Create a new student
        const newStudent = new Student({
            lastName,
            firstName,
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

        const savedStudent = await newStudent.save({ session });

        // Generate a random password for the user
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user for the student
        const newUser = new User({
            cin,
            email,
            phone,
            password: hashedPassword,
            role: 'student',
            student: savedStudent._id, // Link the user to the student
        });

        const savedUser = await newUser.save({ session });

        // Commit the transaction if all operations succeed
        await session.commitTransaction();

        res.status(201).json({
            message: "Student and user created successfully.",
            student: savedStudent,
            userCredentials: {
                cin: savedUser.cin,
                role: savedUser.role,
                email: savedUser.email,
                phone: savedUser.phone,
                password, // Optionally include the plaintext password for initial communication
            },
        });
    } catch (error) {
        // Roll back the transaction on failure
        await session.abortTransaction();
        console.error("Error creating student and user:", error.message);

        // Return specific error messages for validation errors
        const statusCode = error.message.includes("already in use") ? 400 : 500;
        res.status(statusCode).json({ error: error.message });
    } finally {
        session.endSession();
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
export const updateStudent = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        // Find the student by ID
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // Validate that only valid fields are being updated
        const validFields = Object.keys(Student.schema.paths); // List of valid fields in the Student model
        const updateFields = Object.keys(updatedData);

        const invalidFields = updateFields.filter(field => !validFields.includes(field));
        if (invalidFields.length > 0) {
            return res.status(400).json({ message: `Invalid fields: ${invalidFields.join(', ')}` });
        }

        // Update the student with the provided data
        updateFields.forEach((key) => {
            if (student[key] !== undefined && updatedData[key] !== undefined) {
                student[key] = updatedData[key]; // Update only the existing fields
            }
        });

        // Save the updated student
        const updatedStudent = await student.save();

        // Return the updated student
        res.status(200).json({ message: 'Student updated successfully.', updatedStudent });
    } catch (error) {
        // Log detailed error for debugging
        console.error('Error updating student:', error.message);

        // Specific error handling based on error type
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid student ID format.' });
        }

        // Catch any other unexpected errors
        res.status(500).json({ message: 'Server error while updating student.', error: error.message });
    }
};
// Delete a student by ID
export const deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        // Delete the student by ID
        const deletedStudent = await Student.findByIdAndDelete(id, { session });
        if (!deletedStudent) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Student not found." });
        }

        // Delete the associated user account
        const deletedUser = await User.findOneAndDelete({ student: id }, { session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: "Student and associated user account deleted successfully.",
            deletedStudent,
            deletedUser,
        });
    } catch (error) {
        console.error("Error deleting student:", error.message);
        res.status(500).json({ error: "Failed to delete student." });
    }
};