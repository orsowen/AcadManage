import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import Teacher from '../models/Teachers.js';
import User from '../models/User.js';
import { generateRandomPassword } from './UserController.js';
// Create a new teacher
export const createTeacher = async (req, res) => {
    const { lastName, firstName, cin, phone, email, subjectCount } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Create a new teacher
        const newTeacher = new Teacher({ lastName, firstName, subjectCount });

        // Save the teacher
        const savedTeacher = await newTeacher.save({ session });

        // Generate a random password for the user
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user for the teacher
        const newUser = new User({
            cin,
            email,
            phone,
            password: hashedPassword,
            role: 'teacher',
            teacher: savedTeacher._id, // Link the user to the teacher
        });

        // Save the user to the database
        const savedUser = await newUser.save({ session });

        // Commit the transaction if both teacher and user are successfully created
        await session.commitTransaction();

        // Return both the teacher and user details in the response
        res.status(201).json({
            message: 'Teacher and user created successfully.',
            savedTeacher,
            userCredentials: {
                cin: savedUser.cin,
                role: savedUser.role,
                email: savedUser.email,
                phone: savedUser.phone,
                password, // Optionally include the password if needed, but usually, it's not recommended to expose the password
            },
        });
    } catch (error) {
        // Roll back the transaction in case of an error
        await session.abortTransaction();
        console.error('Error creating teacher and user:', error.message);
        res.status(500).json({ error: 'Failed to create teacher and user.', error });
    } finally {
        session.endSession();
    }
};


// Get all teachers
export const getAllTeachers = async (req, res) => {
    try {
        // Fetch teachers and populate user-related fields
        const teachers = await Teacher.find()
            .lean() // Convert documents to plain objects for easier manipulation
            .then(async (teachersList) => {
                // Populate user details for each teacher
                const populatedTeachers = await Promise.all(
                    teachersList.map(async (teacher) => {
                        const user = await User.findOne({ teacher: teacher._id })
                            .select("cin email phone -_id") // Fetch specific fields only
                            .lean();
                        return { ...teacher, ...user }; // Merge teacher and user data
                    })
                );
                return populatedTeachers;
            });

        res.status(200).json({
            message: "Teachers fetched successfully.",
            data: teachers,
        });
    } catch (error) {
        console.error("Error fetching teachers:", error.message);
        res.status(500).json({ error: "Error fetching teachers." });
    }
};
// Get a single teacher by ID
export const getTeacherById = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch the teacher by ID
        const teacher = await Teacher.findById(id).lean(); // Convert to plain object for easier manipulation
        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found." });
        }

        // Fetch the corresponding user details
        const user = await User.findOne({ teacher: id })
            .select("cin email phone -_id") // Fetch specific fields
            .lean();

        // Merge user details into the teacher object
        const result = { ...teacher, ...user };

        res.status(200).json({
            message: "Teacher fetched successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Error fetching teacher:", error.message);
        res.status(500).json({ error: "Error fetching teacher." });
    }
};
// Update a teacher
export const updateTeacher = async (req, res) => {
    const { id } = req.params;
    const { lastName, firstName, subjectCount } = req.body;

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
        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        // Delete the teacher by ID
        const deletedTeacher = await Teacher.findByIdAndDelete(id, { session });
        if (!deletedTeacher) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: "Teacher not found." });
        }

        // Delete the associated user account
        const deletedUser = await User.findOneAndDelete({ teacher: id }, { session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: "Teacher and associated user account deleted successfully.",
            deletedTeacher,
            deletedUser,
        });
    } catch (error) {
        console.error("Error deleting teacher:", error.message);
        res.status(500).json({ error: "Error deleting teacher." });
    }
};