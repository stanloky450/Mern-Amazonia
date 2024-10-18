import express from 'express';
import { seedware } from '../controller/seedControllers.js';

const seedRouter = express.Router();

seedRouter.get('/', seedware);

export default seedRouter;
