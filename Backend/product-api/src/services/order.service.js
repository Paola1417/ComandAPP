const Order = require('../models/Order.model');

const getAllOrders = () => Order.findAll();

const getOrderById = (id) => Order.findByPk(id);

const createOrder = (data) => Order.create(data);

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
