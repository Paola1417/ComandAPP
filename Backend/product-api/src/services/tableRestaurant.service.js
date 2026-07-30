const TableRestaurant = require("../models/TableRestaurant");

const getAllTables = () => TableRestaurant.findAll();

const getTableById = (id) => TableRestaurant.findByPk(id);

const createTable = (data) => TableRestaurant.create(data);

const updateTable = async (id, data) => {
  const table = await TableRestaurant.findByPk(id);

  if (!table) return null;

  await table.update(data);

  return table;
};

const deleteTable = async (id) => {
  const table = await TableRestaurant.findByPk(id);

  if (!table) return null;

  await table.destroy();

  return true;
};

module.exports = {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
};
