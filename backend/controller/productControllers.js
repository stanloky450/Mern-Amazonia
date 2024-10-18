// import express from 'express';
// import Product from '../models/productModel.js';
// import data from '../data.js';
// import expressAsyncHandler from 'express-async-handler';
// import { isAuth, generateToken, isAdmin } from '../utils.js';

// const productRouter = express.Router();

// // Fetch ALl Products
// productRouter.get('/', async (req, res) => {
//   try {
//     const products = await Product.find({});
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Function to get a product by slug
// productRouter.get('/slug/:slug', async (req, res) => {
//   const product = await Product.findOne({ slug: req.params.slug });
//   if (product) {
//     res.send(product);
//   } else {
//     res.status(404).send({ message: 'Product not found' });
//   }
// });

// // Function to get a product by id
// productRouter.get('/id/:id', async (req, res) => {
//   const product = await Product.findById(req.params.id);
//   if (product) {
//     res.send(product);
//   } else {
//     res.status(404).send({ message: 'Product Not Found' });
//   }
// });

// // Search for products
// productRouter.get(
//   '/search',
//   expressAsyncHandler(async (req, res) => {
//     const { query } = req;
//     const pageSize = query.pageSize || PAGE_SIZE;
//     const page = query.page || 1;
//     const category = query.category || '';
//     const price = query.price || '';
//     const rating = query.rating || '';
//     const order = query.order || '';
//     const searchQuery = query.query || '';

//     const queryFilter =
//       searchQuery && searchQuery !== 'all'
//         ? {
//             name: {
//               $regex: searchQuery,
//               $options: 'i',
//             },
//           }
//         : {};
//     const categoryFilter = category && category !== 'all' ? { category } : {};
//     const ratingFilter =
//       rating && rating !== 'all'
//         ? {
//             rating: {
//               $gte: Number(rating),
//             },
//           }
//         : {};
//     const priceFilter =
//       price && price !== 'all'
//         ? {
//             // 1-50
//             price: {
//               $gte: Number(price.split('-')[0]),
//               $lte: Number(price.split('-')[1]),
//             },
//           }
//         : {};
//     const sortOrder =
//       order === 'featured'
//         ? { featured: -1 }
//         : order === 'lowest'
//         ? { price: 1 }
//         : order === 'highest'
//         ? { price: -1 }
//         : order === 'toprated'
//         ? { rating: -1 }
//         : order === 'newest'
//         ? { createdAt: -1 }
//         : { _id: -1 };

//     const products = await Product.find({
//       ...queryFilter,
//       ...categoryFilter,
//       ...priceFilter,
//       ...ratingFilter,
//     })
//       .sort(sortOrder)
//       .skip(pageSize * (page - 1))
//       .limit(pageSize);

//     const countProducts = await Product.countDocuments({
//       ...queryFilter,
//       ...categoryFilter,
//       ...priceFilter,
//       ...ratingFilter,
//     });
//     res.send({
//       products,
//       countProducts,
//       page,
//       pages: Math.ceil(countProducts / pageSize),
//     });
//   })
// );

// // Search for products by category
// productRouter.get(
//   '/categories',
//   expressAsyncHandler(async (req, res) => {
//     const categories = await Product.find().distinct('category');
//     res.send(categories);
//   })
// );

// // Product Review routes
// productRouter.post(
//   '/:id/reviews',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const productId = req.params.id;
//     const product = await Product.findById(productId);
//     if (product) {
//       if (product.reviews.find((x) => x.name === req.user.name)) {
//         return res
//           .status(400)
//           .send({ message: 'You already submitted a review' });
//       }

//       const review = {
//         name: req.user.name,
//         rating: Number(req.body.rating),
//         comment: req.body.comment,
//       };
//       product.reviews.push(review);
//       product.numReviews = product.reviews.length;
//       product.rating =
//         product.reviews.reduce((a, c) => c.rating + a, 0) /
//         product.reviews.length;
//       const updatedProduct = await product.save();
//       res.status(201).send({
//         message: 'Review Created',
//         review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
//         numReviews: product.numReviews,
//         rating: product.rating,
//       });
//     } else {
//       res.status(404).send({ message: 'Product Not Found' });
//     }
//   })
// );

// const PAGE_SIZE = 3;

// productRouter.get(
//   '/admin',
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const { query } = req;
//     const page = query.page || 1;
//     const pageSize = query.pageSize || PAGE_SIZE;

//     const products = await Product.find()
//       .skip(pageSize * (page - 1))
//       .limit(pageSize);
//     const countProducts = await Product.countDocuments();
//     res.send({
//       products,
//       countProducts,
//       page,
//       pages: Math.ceil(countProducts / pageSize),
//     });
//   })
// );

// // Create product
// productRouter.post(
//   '/',
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const newProduct = new Product({
//       name: 'sample name ' + Date.now(),
//       slug: 'sample-name-' + Date.now(),
//       image: '/images/p1.jpg',
//       price: 0,
//       category: 'sample category',
//       brand: 'sample brand',
//       countInStock: 0,
//       rating: 0,
//       numReviews: 0,
//       description: 'sample description',
//     });
//     const product = await newProduct.save();
//     res.send({ message: 'Product Created', product });
//   })
// );

// // Update product
// productRouter.put(
//   '/:id',
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const productId = req.params.id;
//     const product = await Product.findById(productId);
//     if (product) {
//       product.name = req.body.name;
//       product.slug = req.body.slug;
//       product.price = req.body.price;
//       product.image = req.body.image;
//       product.images = req.body.images;
//       product.category = req.body.category;
//       product.brand = req.body.brand;
//       product.countInStock = req.body.countInStock;
//       product.description = req.body.description;
//       await product.save();
//       res.send({ message: 'Product Updated' });
//     } else {
//       res.status(404).send({ message: 'Product Not Found' });
//     }
//   })
// );

// // Delete products
// productRouter.delete(
//   '/:id',
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const product = await Product.findById(req.params.id);
//     if (product) {
//       await product.remove();
//       res.send({ message: 'Product Deleted' });
//     } else {
//       res.status(404).send({ message: 'Product Not Found' });
//     }
//   })
// );

// export default productRouter;

import express from 'express';
import Product from '../models/productModel.js';

export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.send(products);
};

export const createProducts = async (req, res) => {
  const newProduct = new Product({
    name: 'sample name ' + Date.now(),
    slug: 'sample-name-' + Date.now(),
    image: '/images/p1.jpg',
    price: 0,
    category: 'sample category',
    brand: 'sample brand',
    countInStock: 0,
    rating: 0,
    numReviews: 0,
    description: 'sample description',
  });
  const product = await newProduct.save();
  res.send({ message: 'Product Created', product });
};

// export const createProducts = async (req, res) => {
//   const newProduct = new Product({
//     name: '',
//     slug: '',
//     image: '',
//     price: 0,
//     category: '',
//     brand: '',
//     countInStock: 0,
//     rating: 0,
//     numReviews: 0,
//     description: 'sample description',
//   });
//   const product = await newProduct.save();
//   res.send({ message: 'Product Created', product });
// };

// export const createProducts = async (req, res) => {
//   // try {
//   // const { name, slug, images, price, category, brand, rating } = req.body;
//   const prod = req.body;
//   console.log(prod);

//   // Validate input data
//   // if (!name === '') {
//   //   return res.status(400).send({ message: 'All fields are required' });
//   // }

//   // Check if product with the same slug already exists
//   const existingProduct = await Product.findOne({ slug });
//   if (existingProduct) {
//     return res
//       .status(400)
//       .send({ message: 'Product with the same slug already exists' });
//   }

//   const newProduct = new Product(prod);

//   const product = await newProduct.save();
//   res.status(201).send({ message: 'Product Created', product });
//   // console.log(newProduct);
//   // }
//   // catch (error) {
//   //   res.status(500).send({ message: 'Error creating product', error });
//   // }
// };

export const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
    product.name = req.body.name;
    product.slug = req.body.slug;
    product.price = req.body.price;
    product.image = req.body.image;
    product.images = req.body.images;
    product.category = req.body.category;
    product.brand = req.body.brand;
    product.countInStock = req.body.countInStock;
    product.description = req.body.description;
    await product.save();
    res.send({ message: 'Product Updated' });
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
};

// export const deleteProduct = async (req, res) => {
//   const product = await Product.findById(req.params.id);
//   if (product) {
//     await product.remove();
//     res.send({ message: 'Product Deleted' });
//   } else {
//     res.status(404).send({ message: 'Product Not Found' });
//   }
// };

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.send({ message: 'Product Deleted' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error deleting product', error });
  }
};
export const reviewProduct = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
    if (product.reviews.find((x) => x.name === req.user.name)) {
      return res
        .status(400)
        .send({ message: 'You already submitted a review' });
    }

    const review = {
      name: req.user.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;
    const updatedProduct = await product.save();
    res.status(201).send({
      message: 'Review Created',
      review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      numReviews: product.numReviews,
      rating: product.rating,
    });
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
};

const PAGE_SIZE = 3;

export const pagination = async (req, res) => {
  const { query } = req;
  const page = query.page || 1;
  const pageSize = query.pageSize || PAGE_SIZE;

  const products = await Product.find()
    .skip(pageSize * (page - 1))
    .limit(pageSize);
  const countProducts = await Product.countDocuments();
  res.send({
    products,
    countProducts,
    page,
    pages: Math.ceil(countProducts / pageSize),
  });
};

export const searchProducts = async (req, res) => {
  const { query } = req;
  const pageSize = query.pageSize || PAGE_SIZE;
  const page = query.page || 1;
  const category = query.category || '';
  const price = query.price || '';
  const rating = query.rating || '';
  const order = query.order || '';
  const searchQuery = query.query || '';

  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          name: {
            $regex: searchQuery,
            $options: 'i',
          },
        }
      : {};
  const categoryFilter = category && category !== 'all' ? { category } : {};
  const ratingFilter =
    rating && rating !== 'all'
      ? {
          rating: {
            $gte: Number(rating),
          },
        }
      : {};
  const priceFilter =
    price && price !== 'all'
      ? {
          // 1-50
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
      : {};
  const sortOrder =
    order === 'featured'
      ? { featured: -1 }
      : order === 'lowest'
      ? { price: 1 }
      : order === 'highest'
      ? { price: -1 }
      : order === 'toprated'
      ? { rating: -1 }
      : order === 'newest'
      ? { createdAt: -1 }
      : { _id: -1 };

  const products = await Product.find({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  })
    .sort(sortOrder)
    .skip(pageSize * (page - 1))
    .limit(pageSize);

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  });
  res.send({
    products,
    countProducts,
    page,
    pages: Math.ceil(countProducts / pageSize),
  });
};

export const productCategory = async (req, res) => {
  const categories = await Product.find().distinct('category');
  res.send(categories);
};

export const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
};
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
};
