import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import addressRoutes from "./routes/address.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import orderRoutes from "./routes/order.routes.js";
import storeRoutes from "./routes/store.routes.js"
import cartRoutes from "./routes/cart.routes.js";
import userRoutes from "./routes/user.routes.js";


dotenv.config();
connectDB();

const app = express();

//basic middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/auth", authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/category",categoryRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/user", userRoutes);


app.get("/", (req, res) => {
  res.send("Instamart server is running");
});

//err handler 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
