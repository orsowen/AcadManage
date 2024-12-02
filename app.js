
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import dbConnection from './dbConfig/dbConnection.js';
import DepositPeriod from "./routes/DepositPeriod.js";
import internshipRoutes from './routes/InternshipRoutes.js';
import soutenanceStageRoutes from './routes/SoutenanceStageRoutes.js';
import studentRoutes from "./routes/StudentRoutes.js";
import teacherRoutes from './routes/teacherRoutes.js';
import topicsRoutes from './routes/topicRoutes.js';
import Pfe_topic from './routes/Pfe_Topic.js'
import UserConnexionRoutes from "./routes/UserConnexionRoutes.js";


// ENVIRONMENT variables configuration
dotenv.config();

const app = express();
app.use(express.json()); // To parse JSON data in POST requests
const PORT = process.env.PORT || 8800;

// MongoDB Connection
dbConnection();

// Middleware
app.use(cors());
app.use(express.json());


// ROUTES

app.use(["/PFE", "/PFA", "/STAGE"], DepositPeriod);
app.use("/PFE", Pfe_topic);
app.use("/internships", soutenanceStageRoutes);
app.use("/internships", internshipRoutes);
app.use("/internships", soutenanceStageRoutes);
app.use("/topics", topicsRoutes);
app.use("/users", UserConnexionRoutes);
app.use('/teachers', teacherRoutes);
app.use("/students", studentRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
