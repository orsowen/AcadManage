import user from "../models/User.js";

import jwt from "jsonwebtoken";
export const JWT_SECRET = "ISAMM_SECRET";

export const logIn = async (req, res, next) => {
  try {
    const User = await user.findOne({ mail: req.body.mail });
    if (!User) {
      return res.status(401).json({ message: "user not found" });
    }
    const valid = await bycrypt.compare(req.body.password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "password incorrect" });
    }
    res.status(200).json({
      token: jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24" }),
    });
  } catch (error) {}
};
