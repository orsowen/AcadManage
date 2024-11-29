import jwt from "jsonwebtoken"
import utilisateur from "../models/Utilisateur.js"
import { JWT_SECRET } from "../controller/Utilisateurcontroller.js"

export const loggedMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]
    console.log("token: ", token)
    const decodedToken = jwt.verify(token, JWT_SECRET)
    const utilisateurId = decodedToken.utilisateurId
    try {
      const utilisateur = await utilisateur.findOne({ _id: utilisateurId })
      if (utilisateur) {
        req.auth = {
          utilisateurId: utilisateurId,
          role: utilisateur.role,
        }
        next()
      } else {
        res.status(401).json({ error: "utilisateur n'existe pas" })
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
      res.status(403).json({ error: "vous n'avez pas l'autorisation d'acceder a ce route" })
    }
  } catch (e) {
    res.status(401).json({ error: error.message })
  }
}

export const isEnseignant = (req, res, next) => {
  try {
    if (req.auth.role === "enseignant") {
      next()
    } else {
      res.status(403).json({ error: "vous n'avez pas l'autorisation d'acceder a ce route" })
    }
  } catch (e) {
    res.status(401).json({ error: error.message })
  }
}