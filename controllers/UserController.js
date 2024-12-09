
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import User from "../models/User.js";

dotenv.config();
// Function to generate a random password
export const generateRandomPassword = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
};

// Create a new user
export const createUser = async (req, res) => {
    const { cin, role, phone, email, teacher, student } = req.body;

    // Validate required fields
    if (!cin || !role || !phone || !email) {
        return res.status(400).json({ message: 'CIN, role, phone, and email are required.' });
    }
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }
    // Validate role
    const validRoles = ['admin', 'student', 'teacher'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role provided. Allowed roles: admin, student, teacher.' });
    }

    try {
        // Check if the user already exists based on CIN, email, or phone
        const existingUser = await User.findOne({ $or: [{ cin }, { email }, { phone }] });
        if (existingUser) {
            const field = existingUser.cin === cin ? 'CIN' : existingUser.email === email ? 'Email' : 'Phone';
            return res.status(400).json({ message: `${field} is already in use.` });
        }

        // Generate a random password
        const password = generateRandomPassword(); // You can specify the password length if needed

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            cin,
            password: hashedPassword,
            role,
            phone,
            email,
            teacher,
            student,
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Don't return the raw password in the response, instead notify the user.
        res.status(201).json({
            message: 'User created successfully.',
            savedUser,
            password: password, // This can be handled securely through email
            message: 'A random password has been generated and emailed to the user.', // This can be handled securely through email
        });
    } catch (error) {
        console.error('Error creating user:', error.message);

        // Detailed error handling
        if (error.code === 11000) {
            // MongoDB duplicate key error
            return res.status(400).json({ message: 'Duplicate entry detected, possibly CIN, email, or phone already exists.' });
        }

        res.status(500).json({ message: 'Server error while creating user.', error: error.message });
    }
};

// Get a user by ID
export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the user by ID
        const user = await User.findById(id);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Conditionally populate the teacher or student field based on the role
        if (user.role === 'teacher') {
            await user.populate('teacher'); // Populate teacher if role is 'teacher'
        } else if (user.role === 'student') {
            await user.populate('student'); // Populate student if role is 'student'
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: 'Server error while fetching user.', error });
    }
};

// Get a user by cin
export const getUserByCin = async (req, res) => {
    const { cin } = req.params;

    try {
        const user = await User.findOne({ cin });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Conditionally populate the teacher or student field based on the role
        if (user.role === 'teacher') {
            await user.populate('teacher'); // Populate teacher if role is 'teacher'
        } else if (user.role === 'student') {
            await user.populate('student'); // Populate student if role is 'student'
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by cin:', error.message);
        res.status(500).json({ message: 'Server error while fetching user by cin.', error });
    }
};

// Update user details
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { cin, password, role, teacher, student } = req.body;

    try {
        // Find the user to update
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update the user details
        if (cin) user.cin = cin;
        if (password) user.password = await bcrypt.hash(password, 10); // Hash password if updated
        if (role) user.role = role;
        if (teacher) user.teacher = teacher;
        if (student) user.student = student;

        const updatedUser = await user.save();
        res.status(200).json({ message: 'User updated successfully.', updatedUser });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ message: 'Server error while updating user.', error });
    }
};

// Delete a user
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ message: 'Server error while deleting user.', error });
    }
};

// User login (authentication)
export const loginUser = async (req, res) => {
    const { cin, password } = req.body;

    try {
        // Find the user by cin
        const user = await User.findOne({ cin });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Conditionally populate fields based on role
        if (user.role === 'teacher') {
            await user.populate('teacher', '-__v'); // Populate teacher
            user.student = undefined; // Remove student field
        } else if (user.role === 'student') {
            await user.populate('student', '-__v'); // Populate student
            user.teacher = undefined; // Remove teacher field
        }

        // Generate JWT token with teacherId or studentId depending on the role
        const payload = {
            userId: user._id,
            cin: user.cin,
            role: user.role,
            email: user.email,
        };

        // Add teacher or student ID to the payload if not admin
        if (user.role !== 'admin') {
            payload.idRole = user.role === 'teacher' ? user.teacher._id : user.student._id;
            if (user.role === 'student') {
                payload.isStillStudent = user.student.isGraduated === false;
                payload.grade = user.student.grade;
            }
        }
        // console.log(payload);
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });

        res.status(200).json({ message: 'Login successful.', token, user });
    } catch (error) {
        console.error('Error logging in user:', error.message);
        res.status(500).json({ message: 'Server error while logging in.', error });
    }
};
