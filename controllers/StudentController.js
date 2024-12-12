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
            const field = existingUser.phone === phone
                ? 'Phone'
                : existingUser.email === email
                    ? 'Email'
                    : 'CIN';
            return res.status(400).json({ error: `${field} is already in use.` });
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
            address,
        });

        // Save the student
        const savedStudent = await newStudent.save({ session });

        // Generate a secure random password
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

        // Save the user
        const savedUser = await newUser.save({ session });

        // Commit the transaction if both student and user are saved successfully
        await session.commitTransaction();

        // Link the saved user to the student
        savedStudent.user = savedUser._id;
        await savedStudent.save(); // Update the student with the user ID

        // Return the success response
        res.status(201).json({
            message: "Student and user created successfully.",
            student: savedStudent,
            userCredentials: {
                cin: savedUser.cin,
                role: savedUser.role,
                email: savedUser.email,
                phone: savedUser.phone,
                password, // Returning the plaintext password (you may want to omit this in production)
            },
        });
    } catch (error) {
        // Roll back the transaction if an error occurs
        await session.abortTransaction();

        // Log the error and return a response
        console.error("Error creating student and user:", error.message);
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

// Fetch logged in student infos (still dont work)
export const getStudentProfile = async (req, res) => {
    const studentId = req.user.idRole; // Extract the student ID from the JWT token (assuming it stores the student ID)

    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is not available in the token.' });
    }

    try {
        // Fetch the student by ID and populate the necessary fields
        const student = await Student.findById(studentId)
            .populate('user', 'email cin phone') // Populate the user info (email, cin, phone) associated with the student
            .exec();

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // Respond with the student profile
        res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student profile:', error.message);
        res.status(500).json({ error: 'Failed to fetch student profile.' });
    }
};

export const updateStudent = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        // Step 1: Find the student by ID
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // Step 2: Validate that only valid fields are being updated
        const validFields = Object.keys(Student.schema.paths); // Get list of valid fields in the Student model
        const updateFields = Object.keys(updatedData); // Get the fields being updated

        // Check for invalid fields
        const invalidFields = updateFields.filter(field => !validFields.includes(field));
        if (invalidFields.length > 0) {
            return res.status(400).json({ message: `Invalid fields: ${invalidFields.join(', ')}` });
        }

        // Step 3: Perform the update only for the valid fields
        updateFields.forEach((key) => {
            // Update only the existing fields in the document
            if (student[key] !== undefined && updatedData[key] !== undefined) {
                student[key] = updatedData[key]; // Update the student field
            }
        });

        // Step 4: Validate fields before saving
        await student.validate(); // Ensure the updated student data is valid based on model validation

        // Step 5: Save the updated student
        const updatedStudent = await student.save();

        // Step 6: Return the updated student
        res.status(200).json({ message: 'Student updated successfully.', updatedStudent });
    } catch (error) {
        // Log detailed error for debugging
        console.error('Error updating student:', error.message);

        // Step 7: Specific error handling
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid student ID format.' });
        }

        // Validation errors from the model
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation failed.', error: error.message });
        }

        // Catch any other unexpected errors
        res.status(500).json({ message: 'Server error while updating student.', error: error.message });
    }
};

// Delete or Archive a student by ID
export const deleteStudent = async (req, res) => {
    const { id } = req.params; // Extract student ID from request parameters
    let { isArchived } = req.body; // Extract isArchived from the request body

    try {
        // Default isArchived to true if not provided
        if (isArchived === undefined) {
            isArchived = true;
        }

        // Validate that isArchived is a boolean
        if (typeof isArchived !== "boolean") {
            return res.status(400).json({ message: "Invalid value for 'isArchived'. It must be a boolean." });
        }

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        if (isArchived) {
            // Archive the student and associated user
            const student = await Student.findById(id);
            if (!student) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: "Student not found." });
            }

            student.isArchived = true;
            await student.save({ session });

            const user = await User.findOne({ student: id });
            if (user) {
                user.isArchived = true;
                await user.save({ session });
            }

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                message: "Student and associated user archived successfully.",
                student,
                user,
            });
        } else {
            // Permanently delete the student and associated user
            const deletedStudent = await Student.findByIdAndDelete(id, { session });
            if (!deletedStudent) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: "Student not found." });
            }

            const deletedUser = await User.findOneAndDelete({ student: id }, { session });

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                message: "Student and associated user account deleted successfully.",
                deletedStudent,
                deletedUser,
            });
        }
    } catch (error) {
        console.error("Error processing student deletion:", error.message);
        res.status(500).json({ error: "Failed to process student deletion." });
    }
};

export const updateStudentPassword = async (req, res) => {
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
        const user = await User.findOne({ student: id });
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

export const updateStudentProfile = async (req, res) => {
    const studentId = req.user.idRole; // Extract the student ID from the JWT token
    const userId = req.user.userId; // Extract the user ID from the JWT token
    const { firstName, lastName, phone, email, address } = req.body;

    if (!studentId || !userId) {
        return res.status(400).json({
            error: "Missing student or user ID in the token."
        });
    }

    try {
        // Fetch the student and user records
        const [student, user] = await Promise.all([
            Student.findById(studentId),
            User.findById(userId),
        ]);

        if (!student) {
            return res.status(404).json({
                error: "Student not found."
            });
        }

        if (!user) {
            return res.status(404).json({
                error: "User not found."
            });
        }

        // Validate the inputs
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                error: "Invalid email format."
            });
        }

        if (phone && !/^\+?[0-9]{7,15}$/.test(phone)) {
            return res.status(400).json({
                error: "Invalid phone number format."
            });
        }

        // Update student details if provided
        if (firstName) student.firstName = firstName.trim();
        if (lastName) student.lastName = lastName.trim();
        if (address) student.city = address.trim();

        // Update user details if provided
        if (phone) user.phone = phone.trim();
        if (email) user.email = email.trim();

        // Save the updates
        await Promise.all([student.save(), user.save()]);

        // Return the updated student profile with populated user details
        const updatedStudent = await Student.findById(studentId).populate({
            path: "user",
            select: "email phone",
        });

        res.status(200).json({
            message: "Student profile updated successfully.",
            student: updatedStudent,
        });
    } catch (error) {
        console.error("Error updating student profile:", error.message);

        // Handle specific Mongoose errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                error: "Validation error while updating student profile.",
                details: error.errors
            });
        }

        if (error.name === "CastError") {
            return res.status(400).json({
                error: "Invalid ID format provided."
            });
        }

        res.status(500).json({
            error: "An unexpected error occurred while updating student profile.",
            details: error.message
        });
    }
};
