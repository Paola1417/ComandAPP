const service = require("../services/tableRestaurant.service");

exports.getTables = async (req, res, next) => {
  try {
    const tables = await service.getAllTables();
    res.json(tables);
  } catch (error) {
    next(error);
  }
};

exports.getTable = async (req, res, next) => {
  try {
    const table = await service.getTableById(req.params.id);

    if (!table) {
      return res.status(404).json({
        message: "Mesa no encontrada",
      });
    }

    res.json(table);
  } catch (error) {
    next(error);
  }
};

exports.createTable = async (req, res, next) => {
  try {
    const table = await service.createTable(req.body);
    res.status(201).json(table);
  } catch (error) {
    next(error);
  }
};

exports.updateTable = async (req, res, next) => {
  try {
    const table = await service.updateTable(req.params.id, req.body);

    if (!table) {
      return res.status(404).json({
        message: "Mesa no encontrada",
      });
    }

    res.json(table);
  } catch (error) {
    next(error);
  }
};

exports.deleteTable = async (req, res, next) => {
  try {
    const table = await service.deleteTable(req.params.id);

    if (!table) {
      return res.status(404).json({
        message: "Mesa no encontrada",
      });
    }

    res.json({
      message: "Mesa eliminada",
    });
  } catch (error) {
    next(error);
  }
};

exports.regenerateToken = async (req, res, next) => {
  try {
    const table = await service.generateAccessToken(req.params.id);

    if (!table) {
      return res.status(404).json({
        message: "Mesa no encontrada",
      });
    }

    res.json({
      message: "Token de mesa regenerado",
      accessToken: table.accessToken,
    });
  } catch (error) {
    next(error);
  }
};
