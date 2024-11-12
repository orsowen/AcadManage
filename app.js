import mongoose from "mongoose";
import cors from "cors";
import express from "express";

const app = express();

mongoose
    .connect("mongodb://localhost:27017/BdIsamm")
    .then(function () {
        console.log("connection reussie");
    })
    .catch(function (e) {
        console.log("connection echouée" + e);
    });
app.use(cors());
app.use(express.json());


export default app;