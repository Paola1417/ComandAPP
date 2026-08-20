const userService = require("../services/user.service");
const authService = require("../services/auth.service");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const user = await authService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);

    if (!result) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.json({
      message: "Usuario eliminado",
    });
  } catch (error) {
    next(error);
  }
};
