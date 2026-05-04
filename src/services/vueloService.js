import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const getVuelos = async () => {
  const response = await apiClient.get(ENDPOINTS.VUELOS);
  return response.data.data;
};

export const getVueloPorId = async (vueloId) => {
  const response = await apiClient.get(ENDPOINTS.VUELO_POR_ID(vueloId));
  return response.data.data;
};

export const getVuelosPorRuta = async (rutaId) => {
  const response = await apiClient.get(ENDPOINTS.VUELOS_POR_RUTA(rutaId));
  return response.data.data;
};

export const getVueloPorNumero = async (numeroVuelo) => {
  const response = await apiClient.get(ENDPOINTS.VUELO_POR_NUMERO(numeroVuelo));
  return response.data.data;
};

export const getEscalasPorVuelo = async (vueloId) => {
  const response = await apiClient.get(ENDPOINTS.ESCALAS_POR_VUELO(vueloId));
  return response.data.data;
};

export const getAsientosPorVuelo = async (vueloId) => {
  const response = await apiClient.get(ENDPOINTS.ASIENTOS_POR_VUELO(vueloId));
  return response.data.data;
};