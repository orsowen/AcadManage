import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

export const logIn = async (req, res, next) => {
    try {
        const user = await User.findOne({ login: req.body.login });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Compare passwords directly (not recommended for production)
        if (user.password !== req.body.password) {
            return res.status(401).json({ message: "Password incorrect" });
        }

        // Check if JWT_SECRET_KEY is set
        if (!JWT_SECRET_KEY) {
            return res.status(500).json({ message: "JWT_SECRET_KEY is not defined" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },  
            process.env.JWT_SECRET_KEY,             
            { expiresIn: '24h' }                   
        );

        res.status(200).json({
            token: token,
        });
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


export const fetchUser = async (req, res) => {
    try {
        const user = await User.find()
        res.status(200).json({ model: user, message: "success" })
    } catch (error) {
        res.status(400).json({ error: error.message, message: "acces faild" })
    }
}

export const fetchUserBylogin = async (req, res) => {
    console.log("Elogin : ", req.params.login)
    const user = await User.findOne({ _login: req.params.login })
    if (!user) {
        res.status(404).json({ message: "User not found" })
    }
    else {
        res.status(200).json({ model: user, message: "success" })
    }

}

export const AddUser = async (req, res) => {
    try {
        console.log("body: ", req.body)
        const user = new User(req.body)
        await user.save()
        res.status(201).json({ message: "success" })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const delUser = (req, res) => {
    res.status(200).json({ model: user, message: "success" })
}

export const patchUser = async (req, res) => {
    try {
        console.log("body: ", req.body)
        console.log("id: ", req.params.login)
        const user = await User.findOnneAndUpdate({ _login: req.params.login }, req.body, { new: true })
        res.status(200).json({ message: "success" })
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        else {
            res.status(200).json({ model: userser, message: "success" })
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}