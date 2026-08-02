const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const Order = sequelize.define(
  'Pedido',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    mesaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    productos: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    estado: {
        type: DataTypes.ENUM('pendiente', 'en preparación', 'listo para entrega', 'entregado', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendiente',
    },
    },
);

module.exports = Order;