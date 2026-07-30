const express=require("express");
const cors=require("cors");
const helmet=require("helmet");
const morgan=require("morgan");

const productRoutes=require("./routes/product.routes");
const categoryRoutes=require("./routes/category.routes");

const app=express();

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use("/sip/productos",productRoutes);
app.use("/sip/categorias",categoryRoutes);

module.exports=app;