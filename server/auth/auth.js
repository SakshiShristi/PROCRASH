import User from "../model/user.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
    const { username, password } = req.body
    // console.log(username, password);
    if (password.length < 6) {
      return res.status(400).json({ message: "Password less than 6 characters" })
    }
    try {
      await User.create({
        username,
        password,
      }).then((user) =>{
        const maxage = 3 * 60 * 60
        const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET, {
          expiresIn: maxage,
        })
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxage * 1000 })
        res.status(201).json({
          message: "User created successfully",
          user: user._id,
        })
      })
    } catch (error) {
      res.status(400).json({
        message: "An error occurred",
        error: error.message,
      })
    }
  }

  export const login = async (req, res, next) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({
      message: "Username or Password not present",
    })
  }
  try {
    const user = await User.findOne({username, password})
    const maxage = 3 * 60 * 60
    const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET, {
      expiresIn: maxage,
    })
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxage * 1000 })
    res.status(200).json({
      message: "User logged in successfully",
      user: user._id,
    })
  } catch (error) {
    res.status(400).json({
      message: "Username or Password is incorrect",
      error: error.message,
    })
  }
}