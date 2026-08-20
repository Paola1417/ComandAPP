const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Acceso no autorizado. No se proporcionó token.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      rol: decoded.rol,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado.",
    });
  }
};

module.exports = authMiddleware;
