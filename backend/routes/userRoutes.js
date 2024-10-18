import express from 'express';
import expressAsyncHandler from 'express-async-handler';

import { isAuth, isAdmin } from '../utils.js';
import {
  forgetUserPassword,
  getUser,
  getUsers,
  resetPassword,
  signInUser,
  signUpUser,
  updateUser,
} from '../controller/userRoutes.js';

const userRouter = express.Router();

userRouter.get('/', isAuth, isAdmin, expressAsyncHandler(getUsers));

userRouter.get('/:id', isAuth, isAdmin, expressAsyncHandler(getUser));

userRouter.post('/signin', expressAsyncHandler(signInUser));

userRouter.post('/signup', expressAsyncHandler(signUpUser));

userRouter.put('/profile', isAuth, expressAsyncHandler(updateUser));

userRouter.post('/forget-password', expressAsyncHandler(forgetUserPassword));

userRouter.post('/reset-password', expressAsyncHandler(resetPassword));

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

export default userRouter;
