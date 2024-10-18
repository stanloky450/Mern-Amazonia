import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: false, unique: false },
    slug: { type: String, required: false, unique: false },
    image: [String],
    brand: { type: String, required: false },
    category: { type: String, required: false },
    price: { type: Number, required: false },
    countInStock: { type: Number, required: false },
    rating: { type: Number, required: false },
    numReviews: { type: Number, required: false },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', ProductSchema);
export default Product;
