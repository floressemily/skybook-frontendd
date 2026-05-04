// src/services/escala.service.js
import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const getEscalasPorVuelo = async (vueloId) => {
    const response = await apiClient.get(ENDPOINTS.ESCALAS_POR_VUELO(vueloId));
    return response.data.data;
};

// ─────────────────────────────────────────────────────────────
// src/services/aeropuerto.service.js
// (puedes separarlo en su propio archivo — aquí lo incluimos junto por comodidad)
// import apiClient from './apiClient';
// import ENDPOINTS from './endpoints';
//
// export const getAeropuertos = async () => {
//   const response = await apiClient.get(ENDPOINTS.AEROPUERTOS);
//   return response.data.data;
// };