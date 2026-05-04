// src/services/pagoService.js
import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const crearMetodoPago = async (metodoPagoData) => {
  const response = await apiClient.post(ENDPOINTS.METODO_PAGO, metodoPagoData);
  return response.data.data;
};

export const crearPago = async (pagoData) => {
  const response = await apiClient.post(ENDPOINTS.PAGOS, pagoData);
  return response.data.data;
};