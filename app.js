
import cors from "cors";
import dotenv from "dotenv";
import routerPFA from "./routes/PFARoutes.js";
import express from "express";
import dbConnection from "./dbConfig/dbConnection.js";
import DepositPeriod from "./routes/DepositPeriod.js";
import internshipRoutes from "./routes/InternshipRoutes.js";
import soutenanceStageRoutes from "./routes/SoutenanceStageRoutes.js";
import studentRoutes from "./routes/StudentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import topicsRoutes from "./routes/topicRoutes.js";
import UserConnexionRoutes from "./routes/UserConnexionRoutes.js";
import choicePFA from "./routes/ChoiceRoutes.js";



// FOR TESTING ONLY (DO NOT DELETE)
import topicsRoutes from './routes/topicRoutes.js';




// ENVIRONMENT variables configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;

// MongoDB Connection
dbConnection();
app.use(express.json());
// Middleware
app.use(cors());

app.use(express.json());


app.use(express.json()); // To parse JSON data in POST requests

// ROUTES

app.use("/pfe", DepositPeriod);
app.use(["/PFE", "/PFA", "/STAGE"], DepositPeriod);
app.use("/internships", soutenanceStageRoutes);
app.use("/internships", internshipRoutes);
app.use("/internships", soutenanceStageRoutes);
app.use("/users", UserConnexionRoutes);
app.use("/teachers", teacherRoutes);
app.use("/students", studentRoutes);
app.use("/", routerPFA);
app.use("/", choicePFA);
// FOR TESTING ONLY (DO NOT DELETE)
app.use("/topics", topicsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


app.use(cors());
app.use(express.json());



export default app;
