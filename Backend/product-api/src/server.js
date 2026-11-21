const app = require("./app");

const sequelize = require("./config/database");

const initializeDatabase = require("./config/initDatabase");

require("dotenv").config();

require("./models/associations");

const { seedUser } = require("./services/auth.service");

const ensureTableTokens = async () => {
  const TableRestaurant = require("./models/TableRestaurant");
  const crypto = require("crypto");
  const mesasSinToken = await TableRestaurant.findAll({
    where: { accessToken: null },
  });
  for (const mesa of mesasSinToken) {
    mesa.accessToken = crypto.randomBytes(16).toString("hex");
    await mesa.save({ fields: ["accessToken"] });
  }
  if (mesasSinToken.length > 0) {
    console.log(`Tokens asignados a ${mesasSinToken.length} mesa(s) sin acceso.`);
  }
};

const seedUsers = async () => {
  try {
    const admin = await seedUser(
      "Administrador",
      "admin@comandapp.com",
      process.env.ADMIN_PASSWORD || "admin123",
      "administrador",
    );
    console.log(`Usuario admin sembrado/verificado: ${admin.correo}`);

    const cocina = await seedUser(
      "Cocina",
      "cocina@comandapp.com",
      process.env.COCINA_PASSWORD || "cocina123",
      "cocina",
    );
    console.log(`Usuario cocina sembrado/verificado: ${cocina.correo}`);
  } catch (error) {
    console.error("Error sembrando usuarios:", error.message);
  }
};

async function startServer() {
  try {
    // Puerto: Enzonic Deploy inyecta PORT; los servidores del panel usan SERVER_PORT.
    const port = process.env.PORT || process.env.SERVER_PORT || 3000;

    // Crear BD si no existe

    await initializeDatabase();

    // Crear tablas. En producción conviene DB_SYNC=none: las tablas ya existen
    // y "alter" en cada arranque es lento (y arriesgado) en la BD gratuita.

    const syncMode = (process.env.DB_SYNC || "alter").toLowerCase();

    if (syncMode === "none") {
      await sequelize.authenticate();

      console.log("Conexión verificada (sincronización de tablas omitida).");
    } else {
      await sequelize.sync({ alter: true });

      console.log("Tablas verificadas correctamente.");
    }

    await seedUsers();

    await ensureTableTokens();

    app.listen(port, "0.0.0.0", () => {
      console.log(`Servidor iniciado en puerto ${port}`);
    });
  } catch (error) {
    console.error(error);

    // Salir con error para que la plataforma reinicie el proceso en vez de
    // dejarlo vivo sin base de datos.
    process.exit(1);
  }
}

startServer();
