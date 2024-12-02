
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the Topic Schema
const TopicSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    techList: {
        type: [String], // Array of technologies or tools
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Teacher model
        ref: 'Teacher', // Model name to reference
        // required: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create and export the Topic model
const Topic = mongoose.model('Topic', TopicSchema);

export default Topic;
