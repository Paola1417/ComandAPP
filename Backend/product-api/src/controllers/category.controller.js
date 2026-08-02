const service = require("../services/category.service");

exports.getCategories = async (req, res) => {
  try {
    const categories = await service.getAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las categorías" });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await service.getById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la categoría" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await service.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la categoría" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await service.update(req.params.id, req.body);

    if (!category) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la categoría" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await service.remove(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    res.json({
      message: "Categoría eliminada",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la categoría" });
  }
};

exports.getCategoryProducts = async (req, res) => {
  try {
    const products = await service.getProductsByCategory(req.params.categoryId);
    res.json(products);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "Error al obtener los productos de la categoría" });
  }
};

exports.createCategoryProduct = async (req, res) => {
  try {
    const product = await service.createProduct(req.params.categoryId, req.body);
    res.status(201).json(product);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || "Error al crear el producto en la categoría" });
  }
};
