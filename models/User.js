import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    login: { 
        type: String, 
        required: true
        },
    password: { 
        type: String, 
        required: true
            },
    role: { 
        type: String, 
        required: true

<<<<<<< Updated upstream
    }});
    

module.exports = mongoose.model('user', userSchema);
=======
// Define the User Schema
const UserSchema = new Schema({
    login: {
        type: String,
        required: true,
        unique: true,
        trim: true,   
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
    timestamps: true, 
});


const User = mongoose.model('User', UserSchema);

export default User;
>>>>>>> Stashed changes
