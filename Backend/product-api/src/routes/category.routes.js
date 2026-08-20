const express = require("express");

const router = express.Router();

const controller = require("../controllers/category.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("administrador", "cocina"), controller.getCategories);

router.get("/:categoryId/productos", authMiddleware, roleMiddleware("administrador", "cocina"), controller.getCategoryProducts);

router.post("/:categoryId/productos", authMiddleware, roleMiddleware("administrador"), controller.createCategoryProduct);

router.get("/:id", authMiddleware, roleMiddleware("administrador", "cocina"), controller.getCategory);

router.post("/", authMiddleware, roleMiddleware("administrador"), controller.createCategory);

router.put("/:id", authMiddleware, roleMiddleware("administrador"), controller.updateCategory);

router.delete("/:id", authMiddleware, roleMiddleware("administrador"), controller.deleteCategory);

module.exports = router;
