const crypto = require("crypto");
const TableRestaurant = require("../models/TableRestaurant");
const Category = require("../models/Category");
const Product = require("../models/Product");

const getAllTables = () => TableRestaurant.findAll();

const getActiveTables = () =>
  TableRestaurant.findAll({ where: { estado: "activo" } });

const getTableById = (id) => TableRestaurant.findByPk(id);

const getTableByToken = (token) =>
  TableRestaurant.findOne({ where: { accessToken: token } });

const generateAccessToken = async (id) => {
  const table = await TableRestaurant.findByPk(id);
  if (!table) return null;

  table.accessToken = crypto.randomBytes(16).toString("hex");
  await table.save({ fields: ["accessToken"] });

  return table;
};

const getMenu = () =>
  Category.findAll({
    include: [{ model: Product, as: "productos" }],
  });

const createTable = async (data) => {
  const table = await TableRestaurant.create(data);
  return table;
};

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
  getActiveTables,
  getTableById,
  getTableByToken,
  generateAccessToken,
  getMenu,
  createTable,
  updateTable,
  deleteTable,
};
