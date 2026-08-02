const service = require('../services/order.service');

exports.getOrders = async (req, res) => {
    const orders = await service.getAllOrders();
    res.json(orders);
}

exports.getOrder = async (req, res) => {
    const order = await service.getOrderById(req.params.id);

    if (!order) {
        return res.status(404).json({
            message: "Orden no encontrada",
        });
    }   

    res.json(order);
};

exports.createOrder = async (req, res) => {
    const order = await service.createOrder(req.body);
    res.status(201).json(order);
}

exports.updateOrder = async (req, res) => {
    const order = await service.updateOrder(req.params.id, req.body);

    if (!order) {
        return res.status(404).json({
            message: "Orden no encontrada",
        });
    }

    res.json(order);
};

exports.deleteOrder = async (req, res) => {
    const order = await service.deleteOrder(req.params.id);

    if (!order) {
        return res.status(404).json({
            message: "Orden no encontrada",
        });
    }

    res.json({
        message: "Orden eliminada",
    });
};