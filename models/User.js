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

    }});
    

module.exports = mongoose.model('user', userSchema);
