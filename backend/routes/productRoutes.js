import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import { isAuth, isAdmin } from '../utils.js';
import {
  getProducts,
  createProducts,
  updateProduct,
  deleteProduct,
  reviewProduct,
  pagination,
  searchProducts,
  productCategory,
  getProductBySlug,
  getProductById,
} from '../controller/productControllers.js';

const productRouter = express.Router();

productRouter.get('/', getProducts);

productRouter.post('/', isAuth, isAdmin, expressAsyncHandler(createProducts));

productRouter.put('/:id', isAuth, isAdmin, expressAsyncHandler(updateProduct));

productRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(deleteProduct)
);

productRouter.post('/:id/reviews', isAuth, expressAsyncHandler(reviewProduct));

productRouter.get('/admin', isAuth, isAdmin, expressAsyncHandler(pagination));

productRouter.get('/search', expressAsyncHandler(searchProducts));

productRouter.get('/categories', expressAsyncHandler(productCategory));

productRouter.get('/slug/:slug', getProductBySlug);

productRouter.get('/id/:id', getProductById);

export default productRouter;
