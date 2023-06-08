import express from "express";
export const app = express();

import errorHandler from "./middleware/error.js";

app.use(express.json());

//Route imports
import router from "./routes/productRoute.js";

app.use("/api/v1", router);

//Middleware for Errors
app.use(errorHandler);
