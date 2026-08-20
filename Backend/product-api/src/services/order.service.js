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
    throw new Error(         "La orden debe contener al menos un item");
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
      const error = new Error(`Producto con id ${item.productId} no encontrado`);
      error.statusCode = 400;
      throw error;
    }

    const cantidad = Number(item.cantidad ?? item.quantity ?? 0);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      const error = new Error(`Cantidad inválida para producto ${item.productId}`);
      error.statusCode = 400;
      throw error;
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

const createOrderByToken = async (token, data) => {
  const mesa = await TableRestaurant.findOne({ where: { accessToken: token } });

  if (!mesa) {
    const error = new Error("Token de mesa inválido o mesa no encontrada");
    error.statusCode = 404;
    throw error;
  }

  if (mesa.estado !== "activo") {
    const error = new Error("La mesa no está disponible");
    error.statusCode = 403;
    throw error;
  }

  const { observaciones, items } = data;

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
      const error = new Error(`Producto con id ${item.productId} no encontrado`);
      error.statusCode = 400;
      throw error;
    }

    const cantidad = Number(item.cantidad ?? item.quantity ?? 0);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      const error = new Error(`Cantidad inválida para producto ${item.productId}`);
      error.statusCode = 400;
      throw error;
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
        tableRestaurantId: mesa.id,
        observaciones,
        estado: "pendiente",
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

const getLastOrderByToken = async (token) => {
  const mesa = await TableRestaurant.findOne({ where: { accessToken: token } });

  if (!mesa) {
    return null;
  }

  const order = await Order.findOne({
    where: { tableRestaurantId: mesa.id },
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
    order: [["createdAt", "DESC"]],
  });

  return order;
};

const getAllOrdersByToken = async (token) => {
  const mesa = await TableRestaurant.findOne({ where: { accessToken: token } });

  if (!mesa) {
    return null;
  }

  const orders = await Order.findAll({
    where: { tableRestaurantId: mesa.id },
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
    order: [["createdAt", "DESC"]],
  });

  return orders;
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
  createOrderByToken,
  getLastOrderByToken,
  getAllOrdersByToken,
  updateOrder,
  deleteOrder,
};
