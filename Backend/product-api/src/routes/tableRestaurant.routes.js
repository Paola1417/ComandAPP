const express = require("express");

const router = express.Router();

const controller = require("../controllers/tableRestaurant.controller");

router.get("/", controller.getTables);

router.get("/:id", controller.getTable);

router.post("/", controller.createTable);

router.put("/:id", controller.updateTable);

router.delete("/:id", controller.deleteTable);

module.exports = router;
