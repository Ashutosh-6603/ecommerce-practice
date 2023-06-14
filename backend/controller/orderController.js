import { orderModel } from "../models/orderModel.js";
import { productModel } from "../models/productModel.js";

// Create new Order
export const newOrder = async (req, res, next) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    const order = await orderModel.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Order
export const getSingleOrder = async (req, res, next) => {
  try {
    const order = await orderModel
      .findById(req.params.id)
      .populate("user", "name email");

    if (!order) {
      res.status(404);
      return next(new Error("Order not found with this id"));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Get Logged in User Orders
export const myOrders = async (req, res, next) => {
  try {
    const orders = await orderModel.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Orders (for Admin)
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderModel.find();

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Update Order Status (for Admin)
export const updateOrder = async (req, res, next) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      res.status(404);
      return next(new Error("Order not found with this id"));
    }

    if (order.orderStatus === "Delivered") {
      res.status(400);
      return next(new Error("You have already delivered this order"));
    }

    order.orderItems.forEach(async (order) => {
      await updateStock(order.product, order.quantity);
    });

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

async function updateStock(id, quantity) {
  const product = await productModel.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// Delete Order (for Admin)
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await orderModel.findByIdAndDelete(req.params.id);

    if (!order) {
      res.status(404);
      return next(new Error("Order not found with this id"));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
