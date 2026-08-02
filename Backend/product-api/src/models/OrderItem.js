const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const OrderItem = sequelize.define(
  'PedidoItem',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ordenes',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },

    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },

    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: 'ordenes_items',
    timestamps: true,
    hooks: {
      beforeValidate: (item) => {
        if (item.precio != null && item.cantidad != null) {
          const computedSubtotal = Number(item.precio) * Number(item.cantidad);
          item.subtotal = computedSubtotal.toFixed(2);
        }
      },
    },
  },
);

module.exports = OrderItem;
