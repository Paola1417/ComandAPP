const authService = require("../services/auth.service");

exports.login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        message: "correo y password son obligatorios",
      });
    }

    const result = await authService.login(correo, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
