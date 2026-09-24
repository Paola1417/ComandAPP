import axios from 'axios';

// URL base para las peticiones - Usar fetch en lugar de Axios para evitar
// problemas de resolución de IP local en Android/Expo.
// Mantener axios importado por si hay otras necesidades, pero usar fetch para estas peticiones.

// Configuración de timeout para fetch
const FETCH_TIMEOUT = 15000; // 15 segundos

// getTables: Obtiene las mesas disponibles (endpoint público, sin autenticación JWT)
export const getTables = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(`http://192.168.2.114:3000/capp/pedido/mesas`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timeout: La solicitud tardó demasiado (15s)');
    }
    throw new Error(`Error de red: ${error.message}`);
  } finally {
    clearTimeout(timeoutId);
  }
};

// getMenuByToken: Obtiene el menú usando el token de la mesa (endpoint público)
export const getMenuByToken = async (token: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(`http://192.168.2.114:3000/capp/pedido/${token}/menu`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timeout: La solicitud tardó demasiado (15s)');
    }
    throw new Error(`Error de red: ${error.message}`);
  } finally {
    clearTimeout(timeoutId);
  }
};