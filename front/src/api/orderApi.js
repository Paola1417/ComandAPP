import api from './client';

export const fetchCategories = async () => {
  const response = await api.get('/categorias');
  return response.data;
};

export const fetchProducts = async () => {
  const response = await api.get('/productos');
  return response.data;
};

export const fetchTables = async () => {
  const response = await api.get('/mesas');
  return response.data;
};

export const fetchOrders = async () => {
  const response = await api.get('/ordenes');
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post('/ordenes', orderData);
  return response.data;
};
