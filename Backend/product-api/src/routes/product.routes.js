const express = require("express");

const router = express.Router();

const controller = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { upload } = require("../middlewares/uploadMiddleware");

router.get("/", authMiddleware, roleMiddleware("administrador", "cocina"), controller.getProducts);

router.get("/:id", authMiddleware, roleMiddleware("administrador", "cocina"), controller.getProduct);

router.post("/imagen", authMiddleware, roleMiddleware("administrador"), upload.single("imagen"), controller.uploadImagen);

router.post("/", authMiddleware, roleMiddleware("administrador"), controller.createProduct);

router.put("/:id", authMiddleware, roleMiddleware("administrador"), controller.updateProduct);

router.delete("/:id", authMiddleware, roleMiddleware("administrador"), controller.deleteProduct);

module.exports = router;
