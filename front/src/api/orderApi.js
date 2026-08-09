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

export const updateOrder = async (id, data) => {
  const response = await api.put('/ordenes/' + id, data);
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete('/ordenes/' + id);
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post('/categorias', data);
  return response.data;
};

export const createCategoryProduct = async (categoryId, data) => {
  const response = await api.post(`/categorias/${categoryId}/productos`, data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.put(`/categorias/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categorias/${id}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post('/productos', data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`/productos/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/productos/${id}`);
  return response.data;
};

export const createTable = async (data) => {
  const response = await api.post('/mesas', data);
  return response.data;
};

export const updateTable = async (id, data) => {
  const response = await api.put(`/mesas/${id}`, data);
  return response.data;
};

export const deleteTable = async (id) => {
  const response = await api.delete(`/mesas/${id}`);
  return response.data;
};
