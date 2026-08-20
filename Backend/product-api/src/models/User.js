const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const User = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    rol: {
      type: DataTypes.ENUM("administrador", "cocina"),
      allowNull: false,
      defaultValue: "cocina",
    },

    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
  },
);

module.exports = User;
