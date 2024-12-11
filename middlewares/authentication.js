import jwt from "jsonwebtoken";
import user from "../models/User.js";
import dotenv from "dotenv";
import Student from "../models/Student.js";

dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET_KEY;

export const loggedMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("token: ", token);
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.userId;
    try {
      const User = await user.findOne({ _id: userId });
      if (User) {
        req.auth = {
          userId: userId,
          role: user.role,
        };
        next();
      } else {
        res.status(401).json({ error: "user n'existe pas" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// #######################################################################################

// 
// Middleware to verify and decode the JWT token
export const decodeJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming token is sent in 'Authorization' header as "Bearer token"

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    // Verify the JWT token and extract the user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decoded;  // Attach decoded information to req.user
    // console.log('Decoded JWT Payload:', req.user);

    next();  // Proceed to the next middleware or controller
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    // Call decodeJWT to decode the token and populate req.user
    decodeJWT(req, res, () => {
      if (req.user.role === 'admin') {
        next();  // Proceed to the next middleware if the role is 'admin'
      } else {
        res.status(403).json({ error: "Vous n'avez pas l'autorisation d'accéder à cette route." });
      }
    });
  } catch (e) {
    // Use e.message for the error from catch block
    res.status(401).json({ error: e.message });
  }
};


export const isTeacher = (req, res, next) => {
  try {
    // Call decodeJWT to decode the token and populate req.user
    decodeJWT(req, res, () => {
      if (req.user.role === 'teacher') {
        next();  // Proceed to the next middleware if the role is 'teacher'
      } else {
        res.status(403).json({ error: "Vous n'avez pas l'autorisation d'accéder à cette route." });
      }
    });
  } catch (e) {
    // Use e.message for the error from catch block
    res.status(401).json({ error: e.message });
  }
};

export const isStudent = (req, res, next) => {
  try {
    // Call decodeJWT to decode the token and populate req.user
    decodeJWT(req, res, () => {
      if (req.user.role === 'student') {
        next();  // Proceed to the next middleware if the role is 'teacher'
      } else {
        res.status(403).json({ error: "Vous n'avez pas l'autorisation d'accéder à cette route." });
      }
    });
  } catch (e) {
    // Use e.message for the error from catch block
    res.status(401).json({ error: e.message });
  }
};

export const isStillStudent = (req, res, next) => {
  try {
    // Call decodeJWT to decode the token and populate req.user
    decodeJWT(req, res, () => {
      if (req.user.isStillStudent === true) {
        next();  // Proceed to the next middleware if the role is 'teacher'
      } else {
        res.status(403).json({ error: "Vous n'avez pas l'autorisation d'accéder à cette route." });
      }
    });
  } catch (e) {
    // Use e.message for the error from catch block
    res.status(401).json({ error: e.message });
  }
};

export const isAdminOrTeacher = (req, res, next) => {
  try {
    // Call decodeJWT to decode the token and populate req.user
    decodeJWT(req, res, () => {
      if (req.user.role === 'admin' || req.user.role === 'teacher') {
        next();  // Proceed to the next middleware if the role is 'admin'
      } else {
        res.status(403).json({ error: "Vous n'avez pas l'autorisation d'accéder à cette route." });
      }
    });
  } catch (e) {
    // Use e.message for the error from catch block
    res.status(401).json({ error: e.message });
  }
};
export const iSStudent3rdYear = async (req, res, next) => {
  try {
    // Call decodeJWT to decode the token and populate req.user
    decodeJWT(req, res, async () => {
      const userId = req.user.idRole; // Extract the user ID from the token
      const student = await Student.findOne({ user: userId });
      if (student) {
        // Check if the student's grade is "ING3"
        if (student.grade === 'ING3') {
          next(); // Proceed if the user is a third-year student
        } else {
          res.status(403).json({
            error: "Vous devez être un étudiant de troisième année pour accéder à cette route.",
          });
        }
      } else {
        res.status(404).json({ error: "There s no student" });
      }
    });
  } catch (e) {
    // Use e.message for the error from catch block
    res.status(401).json({ error: e.message });
  }
};
