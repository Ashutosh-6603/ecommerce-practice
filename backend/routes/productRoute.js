import express from "express";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
} from "../controller/productController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";
const router = express.Router();

router.get("/products", getAllProducts);
router.post(
  "/product/new",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  createProduct
);
router.put(
  "/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateProduct
);
router.delete(
  "/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteProduct
);
router.get("/product/:id", getProductDetails);

export default router;
