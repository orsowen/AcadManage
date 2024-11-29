import utilisateur from "../model/Utilisateur.js"
import bcrypt from "bcrypt"

import jwt from "jsonwebtoken"
export const JWT_SECRET = "ISAMM_SECRET"

export const logIn = async (req,res,next) => {
    try{
    const utilisateur = await utilisateur.findOne({mail: req.body.mail})
    if(!utilisateur){
        return res.status(401).json({message: "utilisateur not found"})
    }
    const valid = await bycrypt.compare(req.body.password,utilisateur.password)
    if (!valid){
        return res.status(401).json({message: "mot de passe incorrect"})
    }
    res.status(200).json({
        token: jwt.sign({utilisateurId: utilisateur.id},JWT_SECRET,{expiresIn: "24"})
    })
    }catch(error)
    {
    }
}