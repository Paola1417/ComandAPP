import api from './client';

export const login = async (correo, password) => {
  const response = await api.post('/auth/login', { correo, password });
  return response.data;
};
