const express = require("express");

const router = express.Router();

const controller = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get(
  "/",
  authMiddleware,
  roleMiddleware("administrador", "cocina"),
  controller.getOrders,
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("administrador", "cocina"),
  controller.getOrder,
);

router.put(
  "/:id/estado",
  authMiddleware,
  roleMiddleware("administrador", "cocina"),
  controller.updateOrderEstado,
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("administrador", "cocina"),
  controller.createOrder,
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("administrador"),
  controller.updateOrder,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("administrador"),
  controller.deleteOrder,
);

module.exports = router;
