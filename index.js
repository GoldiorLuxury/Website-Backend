import express from 'express';
import dotenv from "dotenv";
dotenv.config();
import dbconnect from "./db/dbconnect.js";
import cookieParser from "cookie-parser";
import productRoutes from './routes/product.routes.js'
import orderRoutes from "./routes/orders.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js"
import reviewRoutes from "./routes/review.routes.js";
import userRoutes from "./routes/user.routes.js";
import contactRoutes from './routes/contact.routes.js';
import cors from 'cors'


const PORT = process.env.PORT;
const app = express()
app.use(express.json())

app.use(cookieParser())

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://goldior-frontend.vercel.app",
      "http://13.234.37.8:3000",
      "http://goldiorluxury.com",
      "http://43.204.39.70"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);




app.get('/', (req, res) => {
  res.send(`server is ready on port ${PORT}`)
})

app.use('/api/product', productRoutes)
app.use('/api/order', orderRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/review", reviewRoutes)
app.use("/api/user", userRoutes)
app.use('/api/contact', contactRoutes);




app.listen(PORT, () => {
  dbconnect();
  console.log("listening at port " + `${PORT}`)
})