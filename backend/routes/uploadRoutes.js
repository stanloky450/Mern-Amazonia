import express from 'express';
import multer from 'multer';
import { isAdmin, isAuth } from '../utils.js';
import { fileUploader } from '../controller/uploadController.js';

const upload = multer();

const uploadRouter = express.Router();

uploadRouter.post('/', isAuth, isAdmin, upload.single('file'), fileUploader);
export default uploadRouter;
