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

    tableRestaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tableRestaurantId',
      references: {
        model: 'mesas',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    estado: {
      type: DataTypes.ENUM(
        'pendiente',
        'en preparación',
        'listo para entrega',
        'entregado',
        'cancelado',
      ),
      allowNull: false,
      defaultValue: 'pendiente',
      validate: {
        isIn: [[
          'pendiente',
          'en preparación',
          'listo para entrega',
          'entregado',
          'cancelado',
        ]],
      },
    },

    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'ordenes',
    timestamps: true,
    hooks: {
      beforeValidate: (order) => {
        if (Array.isArray(order.items) && order.items.length > 0) {
          const total = order.items.reduce((sum, item) => {
            const price = Number(item.precio ?? item.price ?? 0);
            const quantity = Number(item.cantidad ?? item.quantity ?? 1);
            return sum + price * quantity;
          }, 0);

          order.total = Number(total.toFixed(2));
        }
      },
    },
  },
);

module.exports = Order;