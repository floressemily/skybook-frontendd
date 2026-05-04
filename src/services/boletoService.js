// src/services/boletoService.js
import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const crearBoleto = async (boletoData) => {
  const response = await apiClient.post(ENDPOINTS.BOLETOS, boletoData);
  return response.data.data;
};