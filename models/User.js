
import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the User Schema
const UserSchema = new Schema(
  {
    cin: {
      type: String,
      required: true,
      unique: true, // CIN should be unique
      minlength: 8, // CIN must be at least 8 characters long
      validate: {
        validator: function (value) {
          // Check if the CIN is composed only of digits
          return /^[0-9]+$/.test(value); // Ensure CIN contains only digits
        },
        message: 'CIN must be a valid number with at least 8 digits.',
      },
    },
    email: {
      type: String,
      required: true,
      unique: true, // Email should be unique
      match: /^(?!\.)[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, // Validate email format
    },

    phone: {
      type: String,
      required: false,
      unique: true, // should be unique
      match: /^\+?[0-9]{7,15}$/, // Optional: Validate phone number
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
    // Link to Teacher or Student 
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
    isArchived: {
      type: Boolean,
      default: false, // Default value
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
