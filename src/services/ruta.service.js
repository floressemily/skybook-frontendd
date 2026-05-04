// src/services/ruta.service.js
import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

// params: { origen: 'UIO', destino: 'GYE', fecha: 'YYYY-MM-DD' }
export const buscarRutas = async (params) => {
    const response = await apiClient.get(ENDPOINTS.RUTAS_BUSCAR, { params });
    return response.data.data;
};

export const getRutas = async () => {
    const response = await apiClient.get(ENDPOINTS.RUTAS);
    return response.data.data || [];
};