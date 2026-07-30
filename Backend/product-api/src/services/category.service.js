const Category = require("../models/Category");

const getAll = () => Category.findAll();

const getById = (id) => Category.findByPk(id);

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

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
