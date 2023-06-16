import { productModel } from "../models/productModel.js";
import ApiFeatures from "../utils/apiFeatures.js";

//Create Product -- Admin
export const createProduct = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const product = await productModel.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Products
export const getAllProducts = async (req, res, next) => {
  try {
    // const { keyword } = req.query;
    const resultPerPage = 8;
    const productCount = await productModel.countDocuments();
    const apiFeature = new ApiFeatures(productModel.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);
    const products = await apiFeature.query;

    res.status(200).json({
      success: true,
      products,
      productCount,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Product Details
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

// Update Product -- Admin
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

// Create New Review or Update the review
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    const product = await productModel.findById(productId);

    const isReviewd = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id
    );

    if (isReviewd) {
      product.reviews.forEach((rev) => {
        if ((rev) => rev.user.toString() === req.user._id) {
          rev.rating = rating;
          rev.comment = comment;
        }
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Get ll Reviews of a single product
export const getProductReviews = async (req, res, next) => {
  try {
    const product = await productModel.findById(req.query.id);

    if (!product) {
      res.status(404);
      return next(new Error("Product not found"));
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Review
export const deleteReview = async (req, res, next) => {
  try {
    const product = await productModel.findById(req.query.productId);

    if (!product) {
      res.status(404);
      return next(new Error("Product not found"));
    }

    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;

    reviews.forEach((rev) => {
      avg += rev.rating;
    });

    const ratings = avg / product.reviews.length;

    const numOfReviews = reviews.length;

    await productModel.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    next(error);
  }
};
