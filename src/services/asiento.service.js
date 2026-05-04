// src/services/asiento.service.js
import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

// Devuelve todos los asientos del vuelo
export const getAsientosPorVuelo = async (vueloId) => {
  const response = await apiClient.get(ENDPOINTS.ASIENTOS_POR_VUELO(vueloId));
  return response.data.data ?? [];
};

// Cuenta asientos con Estado = "DISPONIBLE"
export const contarDisponibles = (asientos = []) =>
  asientos.filter(a => (a.estado ?? '').toUpperCase() === 'DISPONIBLE').length;
