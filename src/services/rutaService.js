import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const getRutas = async () => {
  const response = await apiClient.get(ENDPOINTS.RUTAS);
  return response.data.data || [];
};

export const buscarRutas = async (params) => {
  try {
    const response = await apiClient.get(ENDPOINTS.RUTAS_BUSCAR, { params });

    if (!response.data || response.data.success !== true) {
      throw new Error(response.data?.message || 'No se encontraron rutas');
    }

    return response.data.data || [];
  } catch (error) {
    console.warn('No se pudo usar /ruta/buscar. Se usará fallback con /vuelo.', error);
    return [];
  }
};