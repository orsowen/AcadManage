import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the User Schema
const UserSchema = new Schema(
  {
    login: {
      type: String,
      required: true,
      unique: true, // Ensures each user has a unique login
      trim: true, // Removes leading and trailing whitespaces
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user", "moderator"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the User model
const User = mongoose.model("User", UserSchema);

export default User;
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
