import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { isAuth, isAdmin } from '../utils.js';
import {
  createOrder,
  deleteOrder,
  deliveredOrder,
  getAllOrder,
  getOrderById,
  myOrder,
  orderDetails,
  updateOrder,
} from '../controller/orderController.js';

const orderRouter = express.Router();

orderRouter.get('/', isAuth, isAdmin, expressAsyncHandler(getAllOrder));

orderRouter.post('/', isAuth, expressAsyncHandler(createOrder));

orderRouter.get('/summary', isAuth, isAdmin, expressAsyncHandler(orderDetails));

orderRouter.get('/mine', isAuth, expressAsyncHandler(myOrder));

orderRouter.get('/:id', isAuth, expressAsyncHandler(getOrderById));

orderRouter.put('/:id/deliver', isAuth, expressAsyncHandler(deliveredOrder));

orderRouter.put('/:id/pay', isAuth, expressAsyncHandler(updateOrder));

orderRouter.delete('/:id', isAuth, isAdmin, expressAsyncHandler(deleteOrder));

export default orderRouter;
