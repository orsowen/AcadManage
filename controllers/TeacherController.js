import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import Teacher from '../models/Teachers.js'
import User from '../models/User.js'
import XLSX from "xlsx"
import { generateRandomPassword, sendCreds } from './UserController.js'

// Create a new teacher
export const createTeacher = async (req, res) => {
    const { lastName, firstName, cin, phone, email, subjectCount, sendCredsInMail = false } = req.body;
    if (!(/^[0-9]+$/.test(cin)) || cin.length < 8) {
        return res.status(400).json({ message: 'CIN must be a valid number with at least 8 digits.' });
    }
    // Email validation regex
    const emailRegex = /^(?!\.)[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }
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
        const newTeacher = new Teacher({ cin,lastName, firstName, subjectCount });
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
            sendCreds(email, password, false);
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

export const createTeacherFromFile = async (req, res) => {
    
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Please provide a file.' });
        }

        let filePath  = req.file.path;
        console.log('File uploaded successfully:', filePath);
        //console.log('Uploaded file:', req.file);

        // Read the Excel file
        const workbook = XLSX.readFile(filePath);

        // Get the first worksheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert the worksheet to JSON
        const data = XLSX.utils.sheet_to_json(worksheet).slice(0);

        if (data.length === 0) {
            return res.status(400).json({ message: 'The uploaded file is empty.' });
        }

        // Respond with the extracted data
        //res.status(200).json({ message: 'Data extracted successfully', data });

        const users = []; 
        let index = 0;
        
        for (const item of data) {
            const session = await mongoose.startSession();
            session.startTransaction()
            index++

            const { lastName, firstName, cin, phone, email, subjectCount } = item;

            if (!cin || !phone || !email || !lastName || !firstName || !subjectCount ) {
                console.warn(`Skipping row ${index}: Missing required fields.`);
                continue;
            }

            // Email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.warn(`Skipping row ${index}: Invalid email format.`);
                continue;
            }

            // Check if the user already exists
            const existingTeacher = await Teacher.findOne({ $or: [{ cin }, { email }, { phone }] });
            const existingUser = await User.findOne({ $or: [{ cin }, { email }, { phone }] });
            if (existingUser || existingTeacher) {
                existingTeacher ? console.warn(`Skipping row ${index}: Teacher already exists.`) : console.warn(`Skipping row ${index}: Teacher already exists.`);
                continue;
            }
            console.log("* data checked and it's safe");

            // creating teachers
            const newTeacher = new Teacher({
                cin,
                lastName,
                firstName,
                subjectCount
            });

            // Save the Teacher
            const savedTeacher = await newTeacher.save({session});
            console.log("* Teacher save success");

            // Generate a random password
            const generatepassword = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(generatepassword, 10);
            console.log("* password generated with success");

            // Create a new user for the teacher
            const newUser = new User({
            cin,
            email,
            phone,
            password: hashedPassword,
            role: 'teacher',
            teacher: savedTeacher._id, // Link the user to the teacher
            });
            console.log("* the new user created with success");

            // Save the user to the database
            const savedUser = await newUser.save({ session });
            await session.commitTransaction();
            
            // Link the saved user to the Teacher
            savedTeacher.user = savedUser._id;
            await savedTeacher.save(); // Update the Teacher with the user ID
           

            const {password, createdAt, updatedAt,__v, student,isArchived, ...newSavedUser} = savedUser.toObject()
            users.push({
                newSavedUser,
                password: generatepassword, // This can be handled securely through email
            });
            console.log("* the new user saved in the database with success");

            // Send the password via email
            await sendCreds(email, generatepassword, false);
            session.endSession();
        }
        if (users.length != 0){
            console.log("* send all data");
            res.status(200).json({message: 'Users created successfully.',users});
        }else
        {
            console.warn("no user created");
            res.status(400).json({message: 'no user created plz check your datafile'});
        }
    } catch (error) {
        // Roll back the transaction if an error occurs
        await session.abortTransaction();
        session.endSession();
        
        console.error('Error processing Excel file:', error.message);
        res.status(500).json({ message: 'Server error while processing Excel file.', error: error.message });
    }
}

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
            .populate('user', 'email phone');

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

        res.status(200).json({
            message: "Teacher profile updated successfully.",
            updatedTeacher,
        });
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
        res.status(200).json({
            message: "Teacher fetched successfully.",
            data: teacher,
        });
    } catch (error) {
        console.error('Error fetching teacher profile:', error.message);
        res.status(500).json({ error: 'Failed to fetch teacher profile.' });
    }
};

// Update a teacher (own profile)
export const updateTeacherByToken = async (req, res) => {
    const { idRole: teacherId, userId } = req.user; // Extract IDs from JWT token
    const { lastName, firstName, subjectCount, phone, email } = req.body;

    if (!teacherId || !userId) {
        return res.status(400).json({
            error: "Missing teacher or user ID in the token.",
        });
    }

    try {
        // Fetch the teacher and user records concurrently
        const [teacher, user] = await Promise.all([
            Teacher.findById(teacherId),
            User.findById(userId)
        ]);

        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found.' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check for duplicate email if it is being updated
        if (email && email !== user.email) {
            const existingUserWithEmail = await User.findOne({ email });
            if (existingUserWithEmail && existingUserWithEmail._id.toString() !== user._id.toString()) {
                return res.status(400).json({
                    error: "The provided email is already in use by another user.",
                });
            }
        }

        // Check for duplicate phone if it is being updated
        if (phone && phone !== user.phone) {
            const existingUserWithPhone = await User.findOne({ phone });
            if (existingUserWithPhone && existingUserWithPhone._id.toString() !== user._id.toString()) {
                return res.status(400).json({
                    error: "The provided phone number is already in use by another user.",
                });
            }
        }

        // Validate inputs
        const errors = [];
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push("Invalid email format.");
        }
        if (phone && !/^\+?[0-9]{7,15}$/.test(phone)) {
            errors.push("Invalid phone number format.");
        }

        if (errors.length) {
            return res.status(400).json({ error: errors });
        }

        // Update teacher details if provided
        teacher.lastName = lastName || teacher.lastName;
        teacher.firstName = firstName || teacher.firstName;
        teacher.subjectCount = subjectCount || teacher.subjectCount;

        // Update user details if provided
        user.phone = phone || user.phone;
        user.email = email || user.email;

        // Save updates concurrently
        await Promise.all([teacher.save(), user.save()]);

        // Fetch updated teacher and user profile
        const updatedTeacher = await Teacher.findById(teacherId).populate({
            path: 'user',
            select: 'email phone',
        });

        res.status(200).json({
            message: "Teacher profile updated successfully.",
            teacher: updatedTeacher,
        });
    } catch (error) {
        console.error('Error updating teacher:', error.message);

        // Handle specific Mongoose errors
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                error: `Duplicate value for field: ${duplicateField}.`,
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                error: "Validation error while updating teacher profile.",
                details: error.errors,
            });
        }

        if (error.name === "CastError") {
            return res.status(400).json({
                error: "Invalid ID format provided.",
            });
        }

        res.status(500).json({
            error: "An unexpected error occurred while updating teacher profile.",
            details: error.message,
        });
    }
};