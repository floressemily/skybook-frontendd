// src/services/clienteService.js
import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

export const crearCliente = async (clienteData) => {
  // clienteData debe tener los campos exactos que pide tu API (camelCase)
  const response = await apiClient.post(ENDPOINTS.CLIENTES, clienteData);
  return response.data.data;
};