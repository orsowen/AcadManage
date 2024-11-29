import jwt from "jsonwebtoken"
import user from "../models/User.js"
const JWT_SECRET = process.env.LOCAL_MONGODB_URL

export const loggedMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]
    console.log("token: ", token)
    const decodedToken = jwt.verify(token, JWT_SECRET)
    const userLogin = decodedToken.userLogin
    try {
      const User = await user.findOne({ _login: userLogin })
      if (User) {
        req.auth = {
          login: userLogin,
          role: user.role
        }
        next()
      } else {
        res.status(401).json({ error: "user n'existe pas" })
      }
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}

export const isAdmin = (req, res, next) => {
    try {
        if (req.auth.role === "admin") {
            next()
        } else {
            res.status(403).json({ error: "you don't have access to this@@ route" })
        }
    } catch (e) {
        res.status(401).json({ error: error.message })
    }
}

export const isTeacher = (req, res, next) => {
  try {
    if (req.auth.role === "Teacher") {
      next()
    } else {
      res.status(403).json({ error: "you don't have access to this route" })
    }
  } catch (e) {
    res.status(401).json({ error: error.message })
  }
}