const app = require("./app");

const sequelize = require("./config/database");

const initializeDatabase = require("./config/initDatabase");

require("dotenv").config();

require("./models/associations");

async function startServer() {
  try {
    // Crear BD si no existe

    await initializeDatabase();

    // Crear tablas

    await sequelize.sync({ alter: true });

    console.log("Tablas verificadas correctamente.");

    app.listen(process.env.PORT, () => {
      console.log(`Servidor iniciado en puerto ${process.env.PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}

startServer();
