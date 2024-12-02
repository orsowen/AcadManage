import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import dbConnection from './dbConfig/dbConnection.js';
import DepositPeriod from "./routes/DepositPeriod.js";
import internshipRoutes from './routes/InternshipRoutes.js';
import topicsRoutes from './routes/topicRoutes.js';
import UserConnexionRoutes  from "./routes/UserConnexionRoutes.js"
import skillRoutes from "./routes/skill.js";
import subjectRoutes from "./routes/subject.js";
import testNotificationsRouter from './routes/test_notif.js';

const app = express();
const PORT = process.env.PORT || 8800;

// MongoDB Connection
dbConnection();

// Middleware
app.use(cors());
app.use(express.json());
// Route lenna mbaaed

// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

app.use('/test-notifications', testNotificationsRouter);
app.use("/competences", skillRoutes);
app.use("/matieres", subjectRoutes);

app.use("/pfe", DepositPeriod);
app.use(["/PFE", "/PFA", "/STAGE"], DepositPeriod);
app.use("/internships", internshipRoutes);
app.use("/topics", topicsRoutes);
app.use("/users", UserConnexionRoutes);
