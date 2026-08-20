import api from './client';

export const login = async (correo, password) => {
  const response = await api.post('/auth/login', { correo, password });
  return response.data;
};

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

export const fetchOrderById = async (id) => {
  const response = await api.get('/ordenes/' + id);
  return response.data;
};

export const updateOrderEstado = async (id, estado) => {
  const response = await api.put('/ordenes/' + id + '/estado', { estado });
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

export const regenerarTokenMesa = async (id) => {
  const response = await api.post(`/mesas/${id}/regenerar-token`);
  return response.data;
};

// ---------- Usuarios (admin) ----------
export const fetchUsers = async () => {
  const response = await api.get('/usuarios');
  return response.data;
};

export const fetchUserById = async (id) => {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post('/usuarios', data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/usuarios/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
};

// ---------- Rutas públicas para cliente (token de mesa) ----------
export const fetchMesaByToken = async (token) => {
  const response = await api.get(`/pedido/${token}`);
  return response.data;
};

export const fetchMesasPublicas = async () => {
  const response = await api.get('/pedido/mesas');
  return response.data;
};

export const fetchProductosPublicos = async (token) => {
  const response = await api.get(`/pedido/${token}/menu`);
  return response.data;
};

export const createOrderPublica = async (token, orderData) => {
  const response = await api.post(`/pedido/${token}`, orderData);
  return response.data;
};

export const fetchEstadoPedido = async (token) => {
  const response = await api.get(`/pedido/${token}/estado`);
  return response.data;
};

export const fetchAllPedidosByToken = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/capp/pedido/${token}/pedidos`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) return [];
  return response.json();
};
