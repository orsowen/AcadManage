
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import dbConnection from './dbConfig/dbConnection.js';
import internshipRoutes from './routes/InternshipRoutes.js';
import topicsRoutes from './routes/topicRoutes.js';
import DepositPeriod from "./routes/DepositPeriod.js";
import UserConnexionRoutes  from "./routes/UserConnexionRoutes.js"



dotenv.config();

const app = express();
app.use(express.json()); // To parse JSON data in POST requests
const PORT = process.env.PORT || 8800;

// MongoDB Connection
dbConnection();

// Middleware
app.use(cors());
app.use(express.json());
// Route lenna mbaaed

app.use("/pfe", DepositPeriod);
app.use("/internships", internshipRoutes);
app.use("/topics", topicsRoutes);
app.use("/users", UserConnexionRoutes);
// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
