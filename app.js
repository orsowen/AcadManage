import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import dbConnection from './dbConfig/dbConnection.js';
import skillRoutes from "./routes/skill.js";
import subjectRoutes from "./routes/subject.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;
app.use(express.json()); 

// MongoDB Connection
dbConnection();

// Middleware
app.use(cors());

// Route lenna mbaaed

// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

app.use("/competences", skillRoutes);
app.use("/matieres", subjectRoutes);


export default app;