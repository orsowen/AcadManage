import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import dbConnection from "./dbConfig/dbConnection.js";
import DepositPeriod from "./routes/DepositPeriod.js";
import router from './routes/index.js';
import routePFA from "./routes/PFA.js";

import PFE from "./routes/PFE.js";
import internshipRoutes from "./routes/internshipRoutes.js";
import UserConnexionRoutes from "./routes/UserConnexionRoutes.js"
import skillRoutes from "./routes/skill.js";
import subjectRoutes from "./routes/subject.js";
import testNotificationsRouter from './routes/test_notif.js';
import TeacherRoutes from "./routes/TeacherRoutes.js";
import StudentRoutes from "./routes/StudentRoutes.js";

// ENVIRONMENT variables configuration
dotenv.config();

// MongoDB Connection
dbConnection();

const app = express();
app.use(express.json()); // To parse JSON data in POST requests
const PORT = process.env.PORT || 8800;

// Middleware
app.use(cors());
app.use(express.json());

// ROUTES

app.use(["/PFE", "/PFA", "/Internership"], DepositPeriod);
app.use('/test-notifications', testNotificationsRouter);
app.use("/competences", skillRoutes);
app.use("/matieres", subjectRoutes);
app.use("/pfe", DepositPeriod);
app.use(["/PFE", "/PFA", "/STAGE"], DepositPeriod);
app.use("/PFE", PFE);
app.use("/", routePFA);
app.use(router); // Place router here for better organization

app.use("/pfe", DepositPeriod);

app.use(["/PFE", "/PFA", "/STAGE"], DepositPeriod);

app.use("/internships", internshipRoutes);
app.use("/topics", topicsRoutes);
app.use("/users", UserConnexionRoutes);

app.use("/teachers",TeacherRoutes)
app.use("/students",StudentRoutes)

// Start server

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// Additional routes
app.use("/internships", internshipRoutes);
app.use("/users", UserConnexionRoutes);

export default app;
