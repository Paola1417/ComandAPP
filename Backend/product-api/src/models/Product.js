const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const Product = sequelize.define(
  "Producto",
  {
    id: {
      type: DataTypes.INTEGER,

      autoIncrement: true,

      primaryKey: true,
    },

    tipo: {
      type: DataTypes.STRING,

      allowNull: false,
    },

    nombre: {
      type: DataTypes.STRING,

      allowNull: false,
    },

    precio: {
      type: DataTypes.DECIMAL(10, 2),

      allowNull: false,
    },

    caracteristicas: {
      type: DataTypes.TEXT,
    },

    imagen: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "productos",
    timestamps: true,
  },
);

module.exports = Product;
