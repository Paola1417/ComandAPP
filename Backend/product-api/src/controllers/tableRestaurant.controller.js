const service = require("../services/tableRestaurant.service");

exports.getTables = async (req, res) => {
  const tables = await service.getAllTables();
  res.json(tables);
};

exports.getTable = async (req, res) => {
  const table = await service.getTableById(req.params.id);

    if (!table) {
    return res.status(404).json({
      message: "Mesa no encontrada",
    });
  }

  res.json(table);
};

exports.createTable = async (req, res) => {
  const table = await service.createTable(req.body);
  res.status(201).json(table);
}

exports.updateTable = async (req, res) => {
    const table = await service.updateTable(req.params.id, req.body);

    if (!table) {
    return res.status(404).json({
      message: "Mesa no encontrada",
    });
  } 

    res.json(table);
};

exports.deleteTable = async (req, res) => {
    const table = await service.deleteTable(req.params.id);

    if (!table) {
        return res.status(404).json({
            message: "Mesa no encontrada",
        });
    }

    res.json({
        message: "Mesa eliminada",
    });
};  