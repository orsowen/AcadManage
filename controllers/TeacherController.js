import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import Teacher from '../models/Teachers.js';
import User from '../models/User.js';
import { generateRandomPassword } from './UserController.js';
// Create a new teacher
export const createTeacher = async (req, res) => {
    const { lastName, firstName, cin, phone, email, subjectCount } = req.body;

    // Initialize session for transactions
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validation: Check if essential fields are provided
        const missingFields = [];
        if (!lastName) missingFields.push('lastName');
        if (!firstName) missingFields.push('firstName');
        if (!cin) missingFields.push('cin');
        if (!email) missingFields.push('email');
        if (!subjectCount) missingFields.push('subjectCount');

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}.`
            });
        }

        // Check if the CIN, email, or phone already exists
        const existingTeacher = await Teacher.findOne({ cin });
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

        if (existingTeacher) {
            return res.status(400).json({ message: 'CIN is already in use.' });
        }
        if (existingUser) {
            const field = existingUser.email === email ? 'Email' : 'Phone';
            return res.status(400).json({ message: `${field} is already in use.` });
        }

        // Create the teacher
        const newTeacher = new Teacher({ lastName, firstName, subjectCount });
        const savedTeacher = await newTeacher.save({ session });

        // Generate a random password for the user
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a user for the teacher
        const newUser = new User({
            cin,
            email,
            phone,
            password: hashedPassword,
            role: 'teacher',
            teacher: savedTeacher._id, // Link the user to the teacher
        });

        const savedUser = await newUser.save({ session });

        // Commit the transaction if both teacher and user are successfully created
        await session.commitTransaction();

        // Associate the teacher with the created user
        savedTeacher.user = savedUser._id;
        await savedTeacher.save();

        // Return the created teacher and user data
        res.status(201).json({
            message: 'Teacher and user created successfully.',
            teacher: savedTeacher,
            userCredentials: {
                cin: savedUser.cin,
                role: savedUser.role,
                email: savedUser.email,
                phone: savedUser.phone,
                password, // Optionally include the plaintext password for communication purposes
            },
        });
    } catch (error) {
        // Roll back the transaction if an error occurs
        await session.abortTransaction();
        console.error('Error creating teacher and user:', error);

        // Send detailed error response
        res.status(500).json({
            error: 'Failed to create teacher and user.',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined, // Provide stack trace in development mode
        });
    } finally {
        session.endSession(); // End the session
    }
};


// Get all teachers
export const getAllTeachers = async (req, res) => {
    try {
        // Fetch teachers and populate user-related fields
        const teachers = await Teacher.find()
            .populate('user', 'email');

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
        const teacher = await Teacher.findById(id)
            .populate('user', 'email');

        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found." });
        }

        res.status(200).json({
            message: "Teacher fetched successfully.",
            data: teacher,
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

// 

// Fetch logged in teacher infos (still dont work)
export const getTeacherProfile = async (req, res) => {
    const id = req.user.idRole; // Extract the  ID from the JWT token (assuming it stores the  ID)

    if (!id) {
        return res.status(400).json({ message: 'ID is not available in the token.' });
    }

    try {
        // Fetch the student by ID and populate the necessary fields
        const teacher = await Teacher.findById(id)
            .populate('user', 'email cin phone') // Populate the user info (email, cin, phone) associated with the student
            .exec();

        if (!teacher) {
            return res.status(404).json({ message: 'teacher not found.' });
        }

        // Respond with the student profile
        res.status(200).json(teacher);
    } catch (error) {
        console.error('Error fetching teacher profile:', error.message);
        res.status(500).json({ error: 'Failed to fetch teacher profile.' });
    }
};

export const updateTeacherPassword = async (req, res) => {
    const { id } = req.params; // Student ID passed as a parameter
    const { password } = req.body; // New password from the request body

    try {
        // Check if the password is provided
        if (!password) {
            return res.status(400).json({ message: 'Password is required.' });
        }

        // Validate password length and complexity (you can adjust the regex as per requirements)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // At least 8 characters, 1 letter, and 1 number
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long and contain at least one letter and one number.',
            });
        }


        // Update the password in the associated user account
        const user = await User.findOne({ teacher: id });
        if (!user) {
            return res.status(404).json({ message: 'Associated user account not found.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        await user.save();

        // Respond with success message
        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error updating student password:', error.message);

        // Handle unexpected errors
        res.status(500).json({ error: 'Failed to update student password.', details: error.message });
    }
};


// Update a teacher
export const updateTeacherByToken = async (req, res) => {
    const id = req.user.idRole;
    const { lastName, firstName, subjectCount } = req.body;

    try {
        // Fetch the existing teacher by ID
        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found.' });
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