

import jwt from "jsonwebtoken"
import User from "../models/User.js"

const JWT_SECRET = process.env.JWT_SECRET;

export const logIn = async (req, res, next) => {
    try {
        const user = await User.findOne({ login: req.body.login })
        if (!user) {
            return res.status(401).json({ message: "user not found" })
        }
        const valid = await bycrypt.compare(req.body.password, user.password)
        if (!valid) {
            return res.status(401).json({ message: "password incorrect" })
        }
        res.status(200).json({
            token: jwt.sign({ userId: user.login }, JWT_SECRET, { expiresIn: "24" })
        })
    } catch (error) {
    }
}

export const fetchUser = async (req, res) => {
    try {
        const user = await User.find()
        res.status(200).json({ model: user, message: "success" })
    } catch (error) {
        res.status(400).json({ error: error.message, message: "acces faild" })
    }
}

export const fetchUserBylogin = async (req, res) => {
    console.log("login : ", req.params.login)
    const user = await User.findOne({ login : req.params.login })
    if (!user) {
        res.status(404).json({ message: "User not found" })
        console.log("User not found")
    }
    else {
        res.status(200).json({ model: user, message: "success" })
        console.log("User found: his name is a", user.role)
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