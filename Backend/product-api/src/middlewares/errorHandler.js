const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "La imagen supera el tamaño máximo permitido (5 MB)"
        : err.message;
    return res.status(400).json({ message });
  }

  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      message: "Error de validación",
      errors,
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      message: "Conflicto de datos: el valor ya existe",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === "SequelizeForeignKeyError") {
    return res.status(400).json({
      message: "Error de clave foránea",
      detail: err.message,
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Error interno del servidor";

  res.status(statusCode).json({
    message,
    ...(err.detail ? { detail: err.detail } : {}),
  });
};

module.exports = errorHandler;
