import express from "express";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
} from "../controller/productController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";
const router = express.Router();

router.get("/products", getAllProducts);
router.post(
  "/admin/product/new",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  createProduct
);
router.put(
  "/admin/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateProduct
);
router.delete(
  "/admin/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteProduct
);
router.get("/admin/product/:id", getProductDetails);
router.get("/product/:id", getProductDetails);
router.put("/review", isAuthenticatedUser, createProductReview);

export default router;
