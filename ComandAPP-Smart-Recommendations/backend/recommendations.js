const ordersData = require('../data/orders.json');

function getRecommendations(productName) {
  // Contar frecuencia de cada producto apareciendo en el mismo pedido que productName
  const frequencyMap = {};

  ordersData.orders.forEach(order => {
    // Verificar si el producto solicitado está en este pedido
    if (order.products.includes(productName)) {
      // Para cada otro producto en el pedido, incrementar su contador
      order.products.forEach(product => {
        if (product !== productName) {
          frequencyMap[product] = (frequencyMap[product] || 0) + 1;
        }
      });
    }
  });

  // Ordenar por frecuencia de mayor a menor
  const sortedProducts = Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  return sortedProducts;
}

module.exports = { getRecommendations };