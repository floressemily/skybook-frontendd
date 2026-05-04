// src/services/paseAbordarService.js
import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const crearPaseAbordar = async (paseData) => {
  const response = await apiClient.post(ENDPOINTS.PASE_ABORDAR, paseData);
  return response.data.data;
};