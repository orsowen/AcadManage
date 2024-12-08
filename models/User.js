import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the User Schema
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Email should be unique
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Validate email format
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "student", "teacher"],
    },
    // Link to Teacher or Student based on cin
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher", // Reference to Teacher model
      default: null,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Reference to Student model
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
