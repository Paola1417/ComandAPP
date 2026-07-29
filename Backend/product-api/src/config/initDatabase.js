const mysql = require("mysql2/promise");
require("dotenv").config();

async function initializeDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`,
    );

    console.log("Base de datos verificada correctamente.");
  } catch (error) {
    console.error("Error creando la base de datos");

    console.error(error);

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = initializeDatabase;
