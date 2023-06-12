import express from "express";
export const app = express();
import cookieParser from "cookie-parser";

import errorHandler from "./middleware/error.js";

app.use(express.json());
app.use(cookieParser());

//Route imports
import product from "./routes/productRoute.js";
import user from "./routes/userRoute.js";

app.use("/api/v1", product);
app.use("/api/v1", user);

//Middleware for Errors
app.use(errorHandler);
