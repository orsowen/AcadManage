import express from "express";
import InternshipRoutes from "./internshipRoutes.js";

const router = express.Router();
const path = "/api-v1/";


router.use(`${path}internships`, InternshipRoutes);

// Example of applying error handling middleware globally zid mbaaed

export default router;
