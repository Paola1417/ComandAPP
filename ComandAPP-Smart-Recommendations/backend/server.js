const express = require('express');
const { getRecommendations } = require('./recommendations');

const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/api/recommendations/:productName', (req, res) => {
  const productName = req.params.productName;
  const recommendations = getRecommendations(productName);

  if (recommendations.length === 0) {
    return res.status(404).json({
      error: 'No se encontraron recomendaciones para el producto especificado'
    });
  }

  res.json({
    product: productName,
    recommendations: recommendations
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de recomendaciones escuchando en http://localhost:${PORT}`);
  console.log(`Endpoint: GET /api/recommendations/:productName`);
});