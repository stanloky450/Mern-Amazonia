import express from 'express';
import bcrypt from 'bcrypt';
// import expressAsyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { isAuth, generateToken, isAdmin } from '../utils.js';

// const userRouter = express.Router();

export const getUsers = async (req, res) => {
  const users = await User.find({});
  res.send(users);
};

export const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ message: 'User Not Found' });
  }
};

export const signInUser = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
      return;
    }
  }
  res.status(401).send({ message: 'Invalid email or password try again' });
};

export const signUpUser = async (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, salt),
  });
  const user = await newUser.save();
  res.send({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user),
  });
};

export const updateUser = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = bcrypt.hashSync(req.body.password, 8);
    }

    const updatedUser = await user.save();
    res.send({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser),
    });
  } else {
    res.status(404).send({ message: 'User not found' });
  }
};

export const forgetUserPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '3h',
    });
    user.resetToken = token;
    await user.save();

    //reset link
    console.log(`${baseUrl()}/reset-password/${token}`);

    mailgun()
      .messages()
      .send(
        {
          from: 'Amazona <me@mg.yourdomain.com>',
          to: `${user.name} <${user.email}>`,
          subject: `Reset Password`,
          html: ` 
             <p>Please Click the following link to reset your password:</p> 
             <a href="${baseUrl()}/reset-password/${token}"}>Reset Password</a>
             `,
        },
        (error, body) => {
          console.log(error);
          console.log(body);
        }
      );
    res.send({ message: 'We sent reset password link to your email.' });
  } else {
    res.status(404).send({ message: 'User not found' });
  }
};

export const resetPassword = async (req, res) => {
  jwt.verify(req.body.token, process.env.JWT_SECRET, async (err, decode) => {
    if (err) {
      res.status(401).send({ message: 'Invalid Token' });
    } else {
      const user = await User.findOne({ resetToken: req.body.token });
      if (user) {
        if (req.body.password) {
          user.password = bcrypt.hashSync(req.body.password, 8);
          await user.save();
          res.send({
            message: 'Password reseted successfully',
          });
        }
      } else {
        res.status(404).send({ message: 'User not found' });
      }
    }
  });
};

// Define the salt rounds
// const saltRounds = 10;

// userRouter.post(
//   '/signup',
//   expressAsyncHandler(async (req, res) => {
//     const { name, email, password } = req.body;

//     // Generate salt
//     const salt = await bcrypt.genSalt(saltRounds);

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create new user
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     // Save user to database
//     const user = await newUser.save();

//     // Send response with user details and token
//     res.send({
//       _id: user._id,
//       //   name: user.name,
//       email: user.email,
//       isAdmin: user.isAdmin,
//       token: generateToken(user),
//     });
//   })
// );
