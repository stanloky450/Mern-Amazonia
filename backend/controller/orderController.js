import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isAdmin, mailgun, payOrderEmailTemplate } from '../utils.js';

const orderRouter = express.Router();

export const getAllOrder = async (req, res) => {
  const orders = await Order.find().populate('user', 'name');
  res.send(orders);
};

export const createOrder = async (req, res) => {
  const newOrder = new Order({
    orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod,
    itemsPrice: req.body.itemsPrice,
    shippingPrice: req.body.shippingPrice,
    taxPrice: req.body.taxPrice,
    totalPrice: req.body.totalPrice,
    user: req.user._id,
    image: req.user.image,
  });

  const order = await newOrder.save();
  res.status(201).send({ message: 'New Order Created', order });
};

// orderRouter.post(
//   '/',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const {
//       orderItems,
//       shippingAddress,
//       paymentMethod,
//       itemsPrice,
//       shippingPrice,
//       taxPrice,
//       totalPrice,
//     } = req.body;

//     const newOrder = new Order({
//       orderItems: orderItems.map((item) => ({
//         ...item,
//         product: mongoose.Types.ObjectId(item._id),
// _id: mongoose.Types.ObjectId(item._id),
//       })),
//       shippingAddress,
//       paymentMethod,
//       itemsPrice,
//       shippingPrice,
//       taxPrice,
//       totalPrice,
//       user: req.user._id,
//     });

//     const createdOrder = await newOrder.save();

//     res.status(201).send({ message: 'New Order Created', order: createdOrder });
//   })
// );

export const orderDetails = async (req, res) => {
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        numOrders: { $sum: 1 },
        totalSales: { $sum: '$totalPrice' },
      },
    },
  ]);
  const users = await User.aggregate([
    {
      $group: {
        _id: null,
        numUsers: { $sum: 1 },
      },
    },
  ]);
  const dailyOrders = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        sales: { $sum: '$totalPrice' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const productCategories = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
  ]);
  res.send({ users, orders, dailyOrders, productCategories });
};

export const myOrder = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.send(orders);
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    res.send(order);
  } else {
    res.status(404).send({ message: 'Order Not Found' });
  }
};

export const deliveredOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    await order.save();
    res.send({ message: 'Order Delivered' });
  } else {
    res.status(404).send({ message: 'Order Not Found' });
  }
};

export const updateOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'email name'
  );
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    mailgun()
      .messages()
      .send(
        {
          from: 'Amazona <amazona@mg.yourdomain.com>',
          to: `${order.user.name} <${order.user.email}>`,
          subject: `New order ${order._id}`,
          html: payOrderEmailTemplate(order),
        },
        (error, body) => {
          if (error) {
            console.log(error);
          } else {
            console.log(body);
          }
        }
      );

    res.send({ message: 'Order Paid', order: updatedOrder });
  } else {
    res.status(404).send({ message: 'Order Not Found' });
  }
};

export const deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    await order.remove();
    res.send({ message: 'Order Deleted' });
  } else {
    res.status(404).send({ message: 'Order Not Found' });
  }
};
