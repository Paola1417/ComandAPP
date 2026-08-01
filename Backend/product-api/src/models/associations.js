const Category = require("./Category");
const Product = require("./Product");

Category.hasMany(Product, {
  foreignKey: "categoryId",
  as: "productos",
  onDelete: "CASCADE",
});

Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "categoria",
});

module.exports = {
  Category,
  Product,
};
