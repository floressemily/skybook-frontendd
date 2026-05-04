// src/services/checkinService.js
import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const realizarCheckIn = async (checkinData) => {
  const response = await apiClient.post(ENDPOINTS.CHECKIN, checkinData);
  return response.data.data;
};