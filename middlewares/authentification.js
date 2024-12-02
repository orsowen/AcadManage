import jwt from "jsonwebtoken"
import user from "../models/User.js"

const JWT_SECRET = process.env.JWT_SECRET_KEY


export const loggedMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        console.log("token: ", token)
        const decodedToken = jwt.verify(token, JWT_SECRET)
        const userId = decodedToken.userId
        try {
            const User = await user.findOne({ _id: userId })
            if (User) {
                req.auth = {
                    userId: userId,
                    role: user.role,
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
        const token = req.headers.authorization?.split(' ')[1]; // Extract token from the Authorization header
        if (!token) {
            return res.status(401).json({ error: "Token is missing" });
        }
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Invalid token" });
            }
            // Attach the decoded token information to the request object (req.auth)
            req.auth = decoded;
            // Check if the user role is "admin"
            if (req.auth.role !== "admin") {
                return res.status(403).json({ error: "Vous n'avez pas l'autorisation d'accéder à cette route" });
            }
            next(); 
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const isTeacher = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Extract token from the Authorization header
        if (!token) {
            return res.status(401).json({ error: "Token is missing" });
        }
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Invalid token" });
            }
            // Attach the decoded token information to the request object (req.auth)
            req.auth = decoded;
            // Check if the user role is "admin"
            if (req.auth.role !== "teacher") {
                return res.status(403).json({ error: "Vous n'avez pas l'autorisation d'accéder à cette route" });
            }
            next();
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
// Middleware pour vérifier si l'utilisateur est admin ou teacher
export const isAdminOrTeacher = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Extraire le token du header Authorization
        if (!token) {
            return res.status(401).json({ error: "Token is missing" });
        }

        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Invalid token" });
            }

            // Attacher les informations décodées du token à la requête
            req.auth = decoded;

            // Vérifier si l'utilisateur est admin ou teacher
            if (req.auth.role !== "admin" && req.auth.role !== "teacher") {
                return res.status(403).json({ error: "Vous n'avez pas l'autorisation d'accéder à cette route" });
            }

            next();  // Si l'utilisateur est admin ou teacher, passez à la route suivante
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

