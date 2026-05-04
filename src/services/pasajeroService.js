// src/services/pasajeroService.js
import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const crearPasajero = async (pasajeroData) => {
  const response = await apiClient.post(ENDPOINTS.PASAJEROS, pasajeroData);
  return response.data.data;
};