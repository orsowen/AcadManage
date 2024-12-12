import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import Teacher from '../models/Teachers.js';
import User from '../models/User.js';
import { generateRandomPassword, sendCreds } from './UserController.js';

// Create a new teacher
export const createTeacher = async (req, res) => {
    const { lastName, firstName, cin, phone, email, subjectCount, sendCredsInMail = false } = req.body;

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

        if (sendCredsInMail) {
            sendCreds(email, password);
        }

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
    const { page = 1, limit = 10, search, sort = "firstName" } = req.query;

    // Validate and parse pagination parameters
    const currentPage = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const currentLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;

    // Build the search filter
    let searchFilter = {};
    if (search) {
        searchFilter = {
            $or: [
                { firstName: { $regex: search, $options: "i" } }, // Search by firstName
                { lastName: { $regex: search, $options: "i" } },  // Search by lastName
            ],
        };
    }

    try {
        // Fetch teachers with filters, pagination, and populate user email
        const teachers = await Teacher.find(searchFilter)
            .populate({
                path: "user",
                select: "email",
                match: search ? { email: { $regex: search, $options: "i" } } : {}, // Match email in User
            })
            .sort(sort) // Sort results by the specified field
            .skip((currentPage - 1) * currentLimit) // Pagination: Skip the required documents
            .limit(currentLimit) // Pagination: Limit the number of documents
            .exec();

        // Filter out teachers with no matching populated user
        const filteredTeachers = teachers.filter((teacher) => teacher.user);

        // Fetch total count for pagination
        const total = await Teacher.countDocuments(searchFilter);

        // Respond with the fetched teacher data
        res.status(200).json({
            total,
            page: currentPage,
            limit: currentLimit,
            totalPages: Math.ceil(total / currentLimit),
            data: filteredTeachers,
        });
    } catch (error) {
        console.error("Error fetching teachers:", error.message);

        // Return a descriptive error response
        res.status(500).json({
            error: "An error occurred while fetching teachers.",
            details: error.message,
        });
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

// Delete or archive a teacher
export const deleteTeacher = async (req, res) => {
    const { id } = req.params; // Extract teacher ID from the request parameters
    const { force } = req.body; // Determine if the teacher should be archived

    try {
        if (!force) {
            // Archive the teacher (soft delete)
            const teacher = await Teacher.findById(id);
            if (!teacher) {
                return res.status(404).json({ message: "Teacher not found." });
            }
            // Archive the associated user account
            const user = await User.findOne({ teacher: id });
            if (user) {
                user.isArchived = true;
                await user.save();
            }

            return res.status(200).json({
                message: "Teacher and associated user archived successfully.",
                archivedTeacher: teacher,
                archivedUser: user || null,
            });
        }

        // Hard delete (completely remove teacher and associated user)
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Delete the teacher by ID
            const deletedTeacher = await Teacher.findByIdAndDelete(id, { session });
            if (!deletedTeacher) {
                throw new Error("Teacher not found.");
            }

            // Delete the associated user account
            const deletedUser = await User.findOneAndDelete({ teacher: id }, { session });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                message: "Teacher and associated user deleted successfully.",
                deletedTeacher,
                deletedUser,
            });
        } catch (transactionError) {
            await session.abortTransaction();
            session.endSession();
            console.error("Transaction failed:", transactionError.message);
            return res.status(500).json({
                error: "Error during transaction while deleting teacher.",
                details: transactionError.message,
            });
        }
    } catch (error) {
        console.error("Error processing teacher deletion:", error.message);
        res.status(500).json({ error: "An error occurred while deleting the teacher.", details: error.message });
    }
};

// Fetch logged in teacher infos
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

// Update a teacher (own profile)
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