import user from "../models/User.js"

import jwt from "jsonwebtoken"
const JWT_SECRET = params.env.JWT_SECRET

export const logIn = async (req,res,next) => {
    try{
    const User = await user.findOne({login: req.body.login})
    if(!User){
        return res.status(401).json({message: "user not found"})
    }
    const valid = await bycrypt.compare(req.body.password,user.password)
    if (!valid){
        return res.status(401).json({message: "password incorrect"})
    }
    res.status(200).json({
        token: jwt.sign({userId: user.id},JWT_SECRET,{expiresIn: "24"})
    })
    }catch(error)
    {
    }
}

export const fetchUser = async (req,res) => {
    try{
    const User = await user.find()
    res.status(200).json({model : User,message :"success"})
    }catch(error)
    {
        res.status(400).json({error:error.message,message: "acces faild"})
    }
}

export const fetchUserByElogin = async (req,res) => {
    console.log("Elogin : ", req.params.login)
    const User = await task.findOne({_id: req.params.login})
    if(!User)
        {
            res.status(404).json({message:"User not found"})
        }
        else{
            res.status(200).json({model : User,message :"success"})
        }
    
}

export const AddUser = async (req,res) => {
   try{
   console.log("body: ",req.body)
   const User = new task(req.body)
   await User.save()
   res.status(201).json({message: "success"})
   }
   catch(error){
       res.status(400).json({error : error.message})
   }
}

export const delUser = (req,res) =>{
    res.status(200).json({model:tasks,message: "success"})
}

export const patchUser = async (req,res) =>{
    try
    {console.log("body: ", req.body)
    console.log("id: ", req.params.login)
    const User = await user.findOnneAndUpdate({_id: req.params.login},req.body,{new:true})
    res.status(200).json({message: "success"})
    if (!User)
        {
            return res.status(404).json({message : "user not found"})
        }
        else{
            res.status(200).json({model: User,message: "success"})
        }
    }
    catch(error)
    {
        res.status(400).json({error:error.message})
    }
}