const roleMiddleware = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Acceso no autorizado. Usuario no autenticado.",
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        message: "Acceso prohibido. No tienes permisos para realizar esta acción.",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
