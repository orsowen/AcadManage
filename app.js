import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import dbConnection from './dbConfig/dbConnection.js';
import internshipRoutes from './routes/InternshipRoutes.js';
import topicsRoutes from './routes/TopicRoutes.js';
import userConnexionRoutes from './routes/UserConnexionRoutes.js';

dotenv.config();

const app = express();
app.use(express.json()); // To parse JSON data in POST requests
const PORT = process.env.PORT || 8800;

// MongoDB Connection
dbConnection();

// Middleware
app.use(cors());

// Route lenna mbaaed
app.use("/internships", internshipRoutes);
app.use("/topics", topicsRoutes);
app.use("/auth", userConnexionRoutes);
// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
