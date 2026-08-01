const express=require("express");
const cors=require("cors");
const helmet=require("helmet");
const morgan=require("morgan");

const productRoutes=require("./routes/product.routes");
const categoryRoutes=require("./routes/category.routes");
const tableRestaurantRoutes=require("./routes/tableRestaurant.routes");


const app=express();

const appname= "capp";

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(`/${appname}/productos`,productRoutes);
app.use(`/${appname}/categorias`,categoryRoutes);
app.use(`/${appname}/mesas`,tableRestaurantRoutes);

module.exports=app;