const bcrypt = require("bcryptjs");
const User = require("../models/User");

const getAllUsers = () =>
  User.findAll({
    attributes: { exclude: ["password"] },
  });

const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  return user;
};

const updateUser = async (id, data) => {
  const user = await User.findByPk(id);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const { nombre, correo, password, rol, estado } = data;

  if (nombre !== undefined) user.nombre = nombre;
  if (correo !== undefined) user.correo = correo;
  if (rol !== undefined) user.rol = rol;
  if (estado !== undefined) user.estado = estado;

  if (password !== undefined && password !== "") {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    user.password = await bcrypt.hash(password, saltRounds);
  }

  await user.save();

  const { password: _, ...userSafe } = user.toJSON();
  return userSafe;
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  await user.destroy();
  return true;
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
