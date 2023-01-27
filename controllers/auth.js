import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from "../models/User.js";

// REGISTER USER
export const register = async (req, res) => {
    try {

      const {
        firstName,
        lastName,
        email,
        password,
        picturePath,
        friends,
        location,
        occupation
      } = req.body;

      const user = await User.findOne({email:email});
      if(user) {
        return res.status(422).json({message: "User already exist!"})
      }else{
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = new User({
        firstName,
        lastName,
        email,
        password : passwordHash,
        picturePath,
        friends,
        location,
        occupation,
        viewedProfile: Math.floor(Math.random() *10000),
        impressions: Math.floor(Math.random() *10000)
      });
      const savedUser = await newUser.save();

      // send back to frontend
      res.status(201).json(savedUser);
      }

      
    } catch (err) {
      // Leartn to customize error messages
      res.status(500).json({error: err.message}) 
    }
};

// LOGIN USER
export const login = async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email: email});
    if(!user) return res.status(401).json({error: "User does not exist!"});

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({error: "Invalid credentials."});

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({token, user})

  } catch (err) {
    res.status(500).json({error: err.message});
  }
}