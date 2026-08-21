const express = require("express");

const router = express.Router();

const clientController = require("../controllers/client.controller");

router.get("/mesas", clientController.listActiveTables);

router.get("/:token", clientController.resolveTable);

router.get("/:token/menu", clientController.getTableMenu);

router.get("/:token/pedidos", clientController.getAllOrdersByToken);

router.post("/:token", clientController.createClientOrder);

router.put("/:token/:orderId", clientController.updateClientOrder);

router.get("/:token/estado", clientController.getOrderState);

module.exports = router;
