require("dotenv").config();

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
const { UPLOADS_DIR } = require("./middlewares/uploadMiddleware");

const app=express();

app.set("trust proxy", 1);

app.disable("etag");

const appname= "capp";

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/uploads", express.static(UPLOADS_DIR));

// CORS: sin CORS_ORIGIN se permite cualquier origen (útil en local). En
// producción se puede limitar al dominio del front, p. ej.
// CORS_ORIGIN=https://usuario.github.io
const corsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors(corsOrigins.length > 0 ? { origin: corsOrigins } : {}));

// crossOriginResourcePolicy permite que el front (GitHub Pages) cargue las
// imágenes de /uploads desde otro dominio.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(morgan("dev"));

app.use(express.json());

// Health check: sirve para plataformas de despliegue y para "despertar" el
// servidor gratuito (duerme tras unos minutos sin tráfico).
app.get("/", (req, res) => {
  res.json({ ok: true, service: "ComandAPP API" });
});

app.get(`/${appname}/health`, (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use(`/${appname}/auth`,authRoutes);
app.use(`/${appname}/usuarios`,userRoutes);
app.use(`/${appname}/pedido`,clientRoutes);
app.use(`/${appname}/productos`,productRoutes);
app.use(`/${appname}/categorias`,categoryRoutes);
app.use(`/${appname}/mesas`,tableRestaurantRoutes);
app.use(`/${appname}/ordenes`,orderRoutes);

app.use(errorHandler);

module.exports=app;
