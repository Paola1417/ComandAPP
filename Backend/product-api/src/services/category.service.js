const Category = require("../models/Category");
const Product = require("../models/Product");

const getAll = () =>
  Category.findAll({
    include: [{ model: Product, as: "productos" }],
  });

const getById = (id) =>
  Category.findByPk(id, {
    include: [{ model: Product, as: "productos" }],
  });

const create = (data) => Category.create(data);

const update = async (id, data) => {
  const category = await Category.findByPk(id);

  if (!category) return null;

  await category.update(data);

  return category;
};

const remove = async (id) => {
  const category = await Category.findByPk(id);

  if (!category) return null;

  await category.destroy();

  return true;
};

const getProductsByCategory = async (categoryId) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    const error = new Error("Categoría no encontrada");
    error.statusCode = 404;
    throw error;
  }

  return Product.findAll({ where: { categoryId } });
};

const createProduct = async (categoryId, data) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    const error = new Error("Categoría no encontrada");
    error.statusCode = 404;
    throw error;
  }

  if (!data?.tipo || !data?.nombre || !data?.precio) {
    const error = new Error("Faltan campos obligatorios: tipo, nombre y precio");
    error.statusCode = 400;
    throw error;
  }

  return Product.create({
    ...data,
    categoryId,
  });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getProductsByCategory,
  createProduct,
};
