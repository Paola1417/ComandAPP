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
    console.log(
      `Tokens asignados a ${mesasSinToken.length} mesa(s) sin acceso.`,
    );
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function initialize() {
  // En producción la BD ya existe: DB_INIT=false ahorra una conexión y el DDL.
  const dbInit = (process.env.DB_INIT || "true").toLowerCase() !== "false";

  if (dbInit) {
    await initializeDatabase();
  }

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

  app.locals.dbReady = true;
}

async function initializeWithRetry(attempts = 5, delayMs = 15000) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await initialize();
      return;
    } catch (error) {
      console.error(
        `Error inicializando la base de datos (intento ${attempt}/${attempts}): ${error.code || ""} ${error.message}`,
      );

      if (attempt === attempts) {
        app.locals.dbError = error.message;
        console.error(
          "La API queda en pie pero sin base de datos; revisa DB_HOST/DB_USER/DB_PASSWORD.",
        );
        return;
      }

      await sleep(delayMs);
    }
  }
}

function startServer() {
  const PORT = process.env.PORT || 3000;

  app.locals.dbReady = false;
  app.locals.dbError = null;

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`ComandAPP iniciado correctamente en el puerto ${PORT}`);
  });

  server.on("error", (error) => {
    console.error("Error iniciando el servidor:", error);
  });

  initializeWithRetry();
}

// startServer();

/*
function startServer() {
  // Enzonic Deploy comprueba la salud en el puerto 3000 (el del preset Express),
  // pero puede inyectar PORT/SERVER_PORT con el puerto del host. Escuchamos en
  // todos los candidatos para no depender de cuál de los dos espera el proxy.
  const ports = [
    ...new Set(
      [
        3000,
        Number(process.env.APP_PORT) || 0,
        Number(process.env.PORT) || 0,
        Number(process.env.SERVER_PORT) || 0,
      ].filter((port) => port > 0),
    ),
  ];

  app.locals.dbReady = false;
  app.locals.dbError = null;

  // Escuchar primero: las plataformas de despliegue matan el proceso si el
  // puerto no responde a tiempo (COLD_START_TIMEOUT). La base de datos se
  // inicializa después, sin bloquear el arranque.
  for (const port of ports) {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Servidor iniciado en puerto ${port}`);
    });
  }

  initializeWithRetry();
}
*/

startServer();
