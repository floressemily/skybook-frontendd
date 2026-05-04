// src/services/avion.service.js
import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const getAvionPorId = async (avionId) => {
  const response = await apiClient.get(`/avion/${avionId}`);
  return response.data.data ?? null;
};
