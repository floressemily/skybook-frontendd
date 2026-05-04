// src/services/reservaService.js
import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const crearReserva = async (reservaData) => {
  const response = await apiClient.post(ENDPOINTS.RESERVAS, reservaData);
  return response.data.data;
};

export const crearReservaPasajero = async (reservaPasajeroData) => {
  const response = await apiClient.post(ENDPOINTS.RESERVA_PASAJERO, reservaPasajeroData);
  return response.data.data;
};