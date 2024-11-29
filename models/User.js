import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the User Schema
const UserSchema = new Schema({
    login: {
        type: String,
        required: true,
        unique: true, // Ensures each user has a unique login
        trim: true,   // Removes leading and trailing whitespaces
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'user', 'moderator'], 
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});


const User = mongoose.model('User', UserSchema)
export default User
