const { Sequelize } = require("sequelize");
require("dotenv").config();

// Los proveedores gestionados (Enzonic, RDS, PlanetScale...) exigen TLS.
// En local (Docker/MySQL) se deja desactivado porque el certificado es autofirmado.
const useSSL = process.env.DB_SSL === "true";

const sequelize = new Sequelize(
  process.env.DB_NAME,

  process.env.DB_USER,

  process.env.DB_PASSWORD,

  {
    host: process.env.DB_HOST,

    port: process.env.DB_PORT,

    dialect: "mysql",

    logging: false,

    dialectOptions: {
      connectTimeout: 20000,

      ...(useSSL
        ? {
            ssl: {
              minVersion: "TLSv1.2",

              rejectUnauthorized: true,
            },
          }
        : {}),
    },

    // La BD gratuita de Enzonic duerme a los 5 minutos sin conexiones. Un
    // "acquire" amplio deja que la conexión espere a que despierte.
    pool: {
      max: Number(process.env.DB_POOL_MAX) || 5,

      min: 0,

      idle: 10000,

      acquire: 60000,
    },

    retry: {
      max: 3,
    },
  },
);

module.exports = sequelize;
