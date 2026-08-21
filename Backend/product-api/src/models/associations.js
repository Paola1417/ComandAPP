const Category = require("./Category");
const Product = require("./Product");
const TableRestaurant = require("./TableRestaurant");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const User = require("./User");

Category.hasMany(Product, {
  foreignKey: "categoryId",
  as: "productos",
  onDelete: "CASCADE",
});

Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "categoria",
});

TableRestaurant.hasMany(Order, {
  foreignKey: "tableRestaurantId",
  as: "ordenes",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Order.belongsTo(TableRestaurant, {
  foreignKey: "tableRestaurantId",
  as: "mesa",
});

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
  onDelete: "CASCADE",
  hooks: true,
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "orden",
});

Product.hasMany(OrderItem, {
  foreignKey: "productId",
  as: "orderItems",
});

OrderItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "producto",
});

module.exports = {
  Category,
  Product,
  TableRestaurant,
  Order,
  OrderItem,
  User,
};
