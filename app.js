<<<<<<< HEAD

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import dbConnection from './dbConfig/dbConnection.js';
import internshipRoutes from './routes/InternshipRoutes.js';
import topicsRoutes from './routes/topicRoutes.js';
import DepositPeriod from "./routes/DepositPeriod.js";
import UserConnexionRoutes  from "./routes/UserConnexionRoutes.js"

=======
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import dbConnection from "./dbConfig/dbConnection.js";
import DepositPeriod from "./routes/DepositPeriod.js";
import router from './routes/index.js';
import routerPFA from "./routes/PFARoutes.js";

import PFE from "./routes/PFE.js";
import internshipRoutes from './routes/InternshipRoutes.js';
import UserConnexionRoutes from "./routes/UserConnexionRoutes.js"
import skillRoutes from "./routes/skill.js";
import subjectRoutes from "./routes/subject.js";
import testNotificationsRouter from './routes/test_notif.js';

// ENVIRONMENT variables configuration
>>>>>>> origin/main
dotenv.config();

// MongoDB Connection
dbConnection();

const app = express();
app.use(express.json()); // To parse JSON data in POST requests
const PORT = process.env.PORT || 8800;

<<<<<<< HEAD
// MongoDB Connection
dbConnection();

=======
>>>>>>> origin/main
// Middleware
app.use(cors());
app.use(express.json());

<<<<<<< HEAD

=======
// ROUTES

app.use(["/PFE", "/PFA", "/Internership"], DepositPeriod);
app.use('/test-notifications', testNotificationsRouter);
app.use("/competences", skillRoutes);
app.use("/matieres", subjectRoutes);
app.use("/pfe", DepositPeriod);
app.use(["/PFE", "/PFA", "/STAGE"], DepositPeriod);
app.use("/PFE", PFE);
app.use("/", routerPFA);
app.use(router); // Place router here for better organization
>>>>>>> origin/main

app.use("/pfe", DepositPeriod);

app.use(["/PFE", "/PFA", "/STAGE"], DepositPeriod);

app.use("/internships", internshipRoutes);
app.use("/topics", topicsRoutes);
app.use("/users", UserConnexionRoutes);
// Start server

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
<<<<<<< HEAD
=======

// Additional routes
app.use("/internships", internshipRoutes);
app.use("/users", UserConnexionRoutes);

export default app;
>>>>>>> origin/main
