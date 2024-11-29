import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import dbConnection from "./dbConfig/dbConnection.js";
import RouterPFA from "./routes/PFARoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;

// MongoDB Connection
dbConnection();
app.use(express.json());
// Middleware
app.use(cors());

app.use("/", RouterPFA);

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
