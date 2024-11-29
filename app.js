import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import dbConnection from './dbConfig/dbConnection.js';
import routerPFA from './routes/PFARoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;

// MongoDB Connection
dbConnection();

// Middleware
app.use(cors());

// Route lenna mbaaed

// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

app.use(cors());
app.use(express.json());

app.use("/",routerPFA)

export default app;
