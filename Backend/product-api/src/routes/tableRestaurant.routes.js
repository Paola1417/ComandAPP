const express = require("express");

const router = express.Router();

const controller = require("../controllers/tableRestaurant.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.get("/", roleMiddleware("administrador", "cocina"), controller.getTables);

router.get("/:id", roleMiddleware("administrador", "cocina"), controller.getTable);

router.post("/", roleMiddleware("administrador"), controller.createTable);

router.put("/:id", roleMiddleware("administrador"), controller.updateTable);

router.delete("/:id", roleMiddleware("administrador"), controller.deleteTable);

router.post("/:id/regenerar-token", roleMiddleware("administrador"), controller.regenerateToken);

module.exports = router;
