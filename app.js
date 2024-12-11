
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import dbConnection from "./dbConfig/dbConnection.js";
import router from './routes/index.js';
import routerPFA from "./routes/PFARoutes.js";


// ENVIRONMENT variables configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;

// MongoDB Connection
dbConnection();
// Middleware
app.use(cors());
app.use(express.json());


// ROUTES


app.use("/", routerPFA);
// All the endpoints below are in index.js for a better ordering and structure
app.use(router);


// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;
