import { productModel } from "../models/productModel.js";
import ApiFeatures from "../utils/apiFeatures.js";

//Create(post) Product -- Admin
export const createProduct = async (req, res, next) => {
  try {
    const product = await productModel.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Get(get) All Products
export const getAllProducts = async (req, res, next) => {
  try {
    console.log(req.query);
   
    const { keyword } = req.query;
    // const apiFeature = new ApiFeatures(productModel.find(), req.query).search();
    // const products = await apiFeature.query;

    const products = await productModel.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    })

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Get Product Details
export const getProductDetails = async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id);

    if (!product) {
      res.status(500);
      return next(new Error("Product not found"));
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Update(put) Product -- Admin
export const updateProduct = async (req, res, next) => {
  try {
    let product = await productModel.findById(req.params.id);

    if (!product) {
      res.status(500);
      return next(new Error("Product not found"));
    }

    product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Product
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(500);
      return next(new Error("Product not found"));
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
