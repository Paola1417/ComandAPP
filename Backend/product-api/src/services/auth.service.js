const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
};

const login = async (correo, password) => {
  const user = await User.findOne({ where: { correo } });

  if (!user) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    throw error;
  }

  if (!user.estado) {
    const error = new Error("Usuario inactivo");
    error.statusCode = 401;
    throw error;
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  if (!passwordValid) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    message: "Login exitoso",
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
    },
  };
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const createUser = async (data) => {
  const { nombre, correo, password, rol, estado } = data;

  if (!nombre || !correo || !password) {
    const error = new Error("nombre, correo y password son obligatorios");
    error.statusCode = 400;
    throw error;
  }

  const existing = await User.findOne({ where: { correo } });
  if (existing) {
    const error = new Error("El correo ya está registrado");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    nombre,
    correo,
    password: hashedPassword,
    rol: rol || "cocina",
    estado: estado !== undefined ? estado : true,
  });

  const { password: _, ...userSafe } = user.toJSON();
  return userSafe;
};

const seedUser = async (nombre, correo, password, rol) => {
  const existing = await User.findOne({ where: { correo } });
  if (existing) {
    return existing;
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    nombre,
    correo,
    password: hashedPassword,
    rol,
    estado: true,
  });

  return user;
};

module.exports = {
  login,
  generateToken,
  hashPassword,
  createUser,
  seedUser,
};
