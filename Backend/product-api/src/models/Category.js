const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const Category = sequelize.define(
  "Categoria",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    descripcion: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "categorias",
    timestamps: true,
  },
);

module.exports = Category;
