// src/services/facturaService.js
import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const crearFactura = async (facturaData) => {
  const response = await apiClient.post(ENDPOINTS.FACTURAS, facturaData);
  return response.data.data;
};