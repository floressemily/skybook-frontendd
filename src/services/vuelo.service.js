// src/services/vuelo.service.js
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