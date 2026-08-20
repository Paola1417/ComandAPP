const express=require("express");
const cors=require("cors");
const helmet=require("helmet");
const morgan=require("morgan");

const productRoutes=require("./routes/product.routes");
const categoryRoutes=require("./routes/category.routes");
const tableRestaurantRoutes=require("./routes/tableRestaurant.routes");
const orderRoutes=require("./routes/order.routes");
const authRoutes=require("./routes/auth.routes");
const userRoutes=require("./routes/user.routes");
const clientRoutes=require("./routes/client.routes");

const errorHandler=require("./middlewares/errorHandler");

const app=express();

app.disable("etag");

const appname= "capp";

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(`/${appname}/auth`,authRoutes);
app.use(`/${appname}/usuarios`,userRoutes);
app.use(`/${appname}/pedido`,clientRoutes);
app.use(`/${appname}/productos`,productRoutes);
app.use(`/${appname}/categorias`,categoryRoutes);
app.use(`/${appname}/mesas`,tableRestaurantRoutes);
app.use(`/${appname}/ordenes`,orderRoutes);

app.use(errorHandler);

module.exports=app;
