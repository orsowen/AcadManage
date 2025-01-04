import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import schedule from 'node-schedule';
import dbConnection from "./dbConfig/dbConnection.js";
import router from "./routes/index.js";
import { notifyAboutDepositDeadline } from './utils/LateNotifReminder.js';

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

// Schedule the late notif job to run every day at 8:00 AM
if (process.env.ENABLE_SCHEDULER === 'true') {
  schedule.scheduleJob("0 8 * * *", () => {
    notifyAboutDepositDeadline().catch(error => {
      console.error("Scheduled job failed:", error.message);
    });
    console.log("Daily deposit deadline notification job scheduled.");
  });
}
// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;