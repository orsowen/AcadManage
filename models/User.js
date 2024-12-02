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

<<<<<<< HEAD
// Create and export the User model
const User = mongoose.model("User", UserSchema);
=======


const User = mongoose.model('User', UserSchema);
>>>>>>> 1cd17d58db827f73806122e52485c50e669dd92a

export default User;
