const tableService = require("../services/tableRestaurant.service");
const orderService = require("../services/order.service");

exports.listActiveTables = async (req, res, next) => {
  try {
    const tables = await tableService.getActiveTables();
    res.json(
      tables.map((t) => ({
        id: t.id,
        numeroMesa: t.numeroMesa,
        mesero: t.mesero || null,
        accessToken: t.accessToken,
      })),
    );
  } catch (error) {
    next(error);
  }
};

exports.resolveTable = async (req, res, next) => {
  try {
    const table = await tableService.getTableByToken(req.params.token);

    if (!table) {
      return res.status(404).json({
        message: "Mesa no encontrada o token inválido",
      });
    }

    res.json({
      id: table.id,
      numeroMesa: table.numeroMesa,
      mesero: table.mesero,
      estado: table.estado,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTableMenu = async (req, res, next) => {
  try {
    const table = await tableService.getTableByToken(req.params.token);

    if (!table || table.estado !== "activo") {
      return res.status(404).json({
        message: "Mesa no encontrada o inactiva",
      });
    }

    const categories = await tableService.getMenu();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.createClientOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrderByToken(
      req.params.token,
      req.body
    );
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

exports.getOrderState = async (req, res, next) => {
  try {
    const order = await orderService.getLastOrderByToken(req.params.token);

    if (!order) {
      return res.status(404).json({
        message: "No hay pedidos para esta mesa",
      });
    }

    res.json({
      id: order.id,
      estado: order.estado,
      total: order.total,
      observaciones: order.observaciones,
      createdAt: order.createdAt,
      mesa: {
        id: order.mesa.id,
        numeroMesa: order.mesa.numeroMesa,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrdersByToken = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrdersByToken(req.params.token);

    if (!orders) {
      return res.status(404).json({
        message: "Mesa no encontrada o token inválido",
      });
    }

    res.json(orders);
  } catch (error) {
    next(error);
  }
};
