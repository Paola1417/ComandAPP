const sequelize = require("../config/database");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const TableRestaurant = require("../models/TableRestaurant");
const Product = require("../models/Product");

const getAllOrders = () =>
  Order.findAll({
    include: [
      {
        model: TableRestaurant,
        as: "mesa",
      },
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "producto",
            attributes: ["id", "nombre", "tipo", "precio"],
          },
        ],
      },
    ],
  });

const getOrderById = (id) =>
  Order.findByPk(id, {
    include: [
      {
        model: TableRestaurant,
        as: "mesa",
      },
      {
        model: OrderItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "producto",
            attributes: ["id", "nombre", "tipo", "precio"],
          },
        ],
      },
    ],
  });

const createOrder = async (data) => {
  const { tableRestaurantId, observaciones, estado, items } = data;

  if (!tableRestaurantId) {
    throw new Error("tableRestaurantId es obligatorio");
  }

  const mesa = await TableRestaurant.findByPk(tableRestaurantId);
  if (!mesa) {
    throw new Error("La mesa indicada no existe");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("La orden debe contener al menos un item");
  }

  const productIds = items.map((item) => item.productId);
  const productos = await Product.findAll({
    where: {
      id: productIds,
    },
  });

  const productosPorId = productos.reduce((acc, producto) => {
    acc[producto.id] = producto;
    return acc;
  }, {});

  const orderItems = items.map((item) => {
    const product = productosPorId[item.productId];
    if (!product) {
      throw new Error(`Producto con id ${item.productId} no encontrado`);
    }

    const cantidad = Number(item.cantidad ?? item.quantity ?? 0);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new Error(`Cantidad inválida para producto ${item.productId}`);
    }

    return {
      productId: product.id,
      productName: product.nombre,
      cantidad,
      precio: product.precio,
    };
  });

  return sequelize.transaction(async (transaction) => {
    const order = await Order.create(
      {
        tableRestaurantId,
        observaciones,
        estado,
        items: orderItems,
      },
      {
        include: [
          {
            model: OrderItem,
            as: "items",
          },
        ],
        transaction,
      },
    );

    return order;
  });
};

const updateOrder = async (id, data) => {
  const order = await Order.findByPk(id);

  if (!order) return null;

  await order.update(data);

  return order;
};

const deleteOrder = async (id) => {
  const order = await Order.findByPk(id);

  if (!order) return null;

  await order.destroy();

  return true;
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
