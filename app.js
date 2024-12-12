import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import dbConnection from "./dbConfig/dbConnection.js";
import router from "./routes/index.js";

// ENVIRONMENT variables configuration
dotenv.config();

// MongoDB Connection
dbConnection();

const app = express();
const PORT = process.env.PORT || 8800;

// Middleware
app.use(cors());
app.use(express.json());


// All the endpoints below are in index.js for a better ordering and structure
app.use(router);

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;