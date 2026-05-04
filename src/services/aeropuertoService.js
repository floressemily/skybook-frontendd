import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const getAeropuertos = async () => {
  const response = await apiClient.get(ENDPOINTS.AEROPUERTOS);

  console.log('Respuesta aeropuertos:', response.data);

  if (!response.data || response.data.success !== true) {
    throw new Error(response.data?.message || 'No se pudieron cargar los aeropuertos');
  }

  return response.data.data || [];
};

export const getAeropuertoPorCodigo = async (codigoIata) => {
  const response = await apiClient.get(`${ENDPOINTS.AEROPUERTOS}/por-codigo/${codigoIata}`);
  return response.data.data;
};