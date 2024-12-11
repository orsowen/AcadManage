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

// ENVIRONMENT variables configuration
dotenv.config();

// MongoDB Connection
dbConnection();

const app = express();
const PORT = process.env.PORT || 8800;

// Middleware
app.use(cors());
app.use(express.json());

// ROUTES

app.use(["/PFE", "/PFA", "/Internership"], DepositPeriod);
app.use("/pfe", DepositPeriod);
app.use(["/PFE", "/PFA", "/STAGE"], DepositPeriod);
app.use("/PFE", PFE);
app.use("/", routerPFA);
app.use("/internships", internshipRoutes);
app.use("/users", UserConnexionRoutes);


app.use(router); // Place router here for better organization

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;
