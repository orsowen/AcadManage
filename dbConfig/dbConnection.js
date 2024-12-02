import mongoose from 'mongoose';

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
        });
        console.log("DB connection established");
    } catch (error) {
        console.error("DB error:", error);
        process.exit(1); // Exit process with failure
    }
};

// Optionally, handle connection errors after initial connection
mongoose.connection.on('error', err => {
    console.error('Mongoose connection error:', err);
});

// Optionally, handle disconnections and retries
mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose disconnected. Attempting to reconnect...');
    mongoose.connect(process.env.MONGODB_URL, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
    }).catch(err => {
        console.error('DB reconnection error:', err);
    });
});

export default dbConnection;
