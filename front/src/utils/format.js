export const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '$0';
  return '$' + num.toLocaleString('es-CO');
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatOrderId = (id) => {
  return '#PED-' + String(id).padStart(6, '0');
};

const CATEGORY_ICONS = {
  hamburguesa: '🍔',
  hamburguesas: '🍔',
  combo: '🍟',
  combos: '🍟',
  bebida: '🥤',
  bebidas: '🥤',
  postre: '🍰',
  postres: '🍰',
  pizza: '🍕',
  burguer: '🍔',
};

export const getCategoryIcon = (categoryName) => {
  const key = String(categoryName).toLowerCase().trim();
  return CATEGORY_ICONS[key] || CATEGORY_ICONS[key.replace(/\s+/g, '')] || '🍽️';
};
