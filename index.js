import express from 'express';
import dotenv from "dotenv";
dotenv.config();
import dbconnect from "./db/dbconnect.js";
import cookieParser from "cookie-parser";
import productRoutes from './routes/product.routes.js'
import orderRoutes from "./routes/orders.routes.js";

// import recipeRoutes from './routes/recipe.routes.js'
// import userRoutes from './routes/user.routes.js'


const PORT = process.env.PORT;
const app = express()
app.use(express.json())

app.use(cookieParser())


app.get('/', (req, res)=>{
    res.send(`server is ready on port ${PORT}`)
})

app.use('/api/product', productRoutes)
app.use('/api/order', orderRoutes)





app.listen(PORT, ()=>{
    dbconnect();
    console.log("listening at port "+`${PORT}`)})