const service = require("../services/category.service");

exports.getCategories = async (req, res) => {
  const categories = await service.getAll();
  res.json(categories);
};

exports.getCategory = async (req, res) => {
  const category = await service.getById(req.params.id);

  if (!category) {
    return res.status(404).json({
      message: "Categoría no encontrada",
    });
  }

  res.json(category);
};

exports.createCategory = async (req, res) => {
  const category = await service.create(req.body);
  res.status(201).json(category);
};

exports.updateCategory = async (req, res) => {
  const category = await service.update(req.params.id, req.body);

  if (!category) {
    return res.status(404).json({
      message: "Categoría no encontrada",
    });
  }

  res.json(category);
};

exports.deleteCategory = async (req, res) => {
  const category = await service.remove(req.params.id);

  if (!category) {
    return res.status(404).json({
      message: "Categoría no encontrada",
    });
  }

  res.json({
    message: "Categoría eliminada",
  });
};
