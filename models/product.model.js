import { Schema, model } from 'mongoose';

function arrayLimit(val) {
  return val.length <= 3;
}

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
  },
  keynotes: {
    type: [
      {
        name: { type: String, required: true },
        image: { type: String, required: true },
      },
    ],
    validate: [arrayLimit, "{PATH} exceeds the limit of 3"], // Ensures the array has no more than 3 elements
  },
  capacityInML: {
    type: [Number], // Array of numbers representing capacities in ml
    required: true,
  },
  stockLeft: {
    type: Number,
    required: true,
    min: 0, // Ensures stock cannot be negative
  },
  imgUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  description2: {
    type: String,
  },
  description2heading: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Ensures price cannot be negative
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100, // Discount percentage should be between 0 and 100
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the creation date
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically updates when the product is modified
  },
  noOfOrders: {
    type: Number,
    default: 0,
  },
});

// Create the product model
const Product = model('Product', productSchema);

export default Product;
