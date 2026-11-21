const mysql = require("mysql2/promise");
require("dotenv").config();

// Mismo criterio que en config/database.js: los hosts gestionados exigen TLS.
const useSSL = process.env.DB_SSL === "true";

// Si el usuario gestionado no puede crear bases, se continúa y se deja que
// sequelize compruebe que la base existe realmente.
const erroresDePermiso = [
  "ER_DBACCESS_DENIED_ERROR",

  "ER_ACCESS_DENIED_ERROR",

  "ER_SPECIFIC_ACCESS_DENIED_ERROR",
];

async function initializeDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,

      port: process.env.DB_PORT,

      user: process.env.DB_USER,

      password: process.env.DB_PASSWORD,

      ...(useSSL
        ? {
            ssl: {
              minVersion: "TLSv1.2",

              rejectUnauthorized: true,
            },
          }
        : {}),
    });

    try {
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`,
      );

      console.log("Base de datos verificada correctamente.");
    } catch (error) {
      if (!erroresDePermiso.includes(error.code)) {
        throw error;
      }

      console.warn(
        `No se pudo crear la base "${process.env.DB_NAME}" (${error.code}); se asume que ya existe y se continúa.`,
      );
    }
  } catch (error) {
    console.error(
      `Error creando la base de datos: ${error.code || ""} ${error.message}`,
    );

    if (error.code === "ER_SECURE_TRANSPORT_REQUIRED") {
      console.error(
        "El servidor exige TLS: agrega DB_SSL=true al archivo .env.",
      );
    }

    // Se propaga para que server.js reintente sin tumbar el proceso.
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = initializeDatabase;
