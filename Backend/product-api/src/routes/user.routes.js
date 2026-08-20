const express = require("express");

const router = express.Router();

const controller = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware, roleMiddleware("administrador"));

router.get("/", controller.getUsers);

router.get("/:id", controller.getUser);

router.post("/", controller.createUser);

router.put("/:id", controller.updateUser);

router.delete("/:id", controller.deleteUser);

module.exports = router;
