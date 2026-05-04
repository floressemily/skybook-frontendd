// src/services/flightDetail.service.js
// Todos los datos vienen de la API real. Ningún dato inventado.
// Usa ENDPOINTS del registry central para consistencia con el resto del proyecto.

import apiClient from './apiClient';
import ENDPOINTS from './endpoints';

// ── Vuelo ──────────────────────────────────────────────────────────────────────
export const getVueloPorId = async (vueloId) => {
  const res = await apiClient.get(ENDPOINTS.VUELO_POR_ID(vueloId));
  return res.data.data ?? null;
};

// ── Ruta ──────────────────────────────────────────────────────────────────────
export const getRutaPorId = async (rutaId) => {
  const res = await apiClient.get(ENDPOINTS.RUTA_POR_ID(rutaId));
  return res.data.data ?? null;
};

// ── Aeropuerto ────────────────────────────────────────────────────────────────
export const getAeropuertoPorId = async (aeropuertoId) => {
  const res = await apiClient.get(ENDPOINTS.AEROPUERTO_POR_ID(aeropuertoId));
  return res.data.data ?? null;
};

// ── Avión ─────────────────────────────────────────────────────────────────────
export const getAvionPorId = async (avionId) => {
  const res = await apiClient.get(ENDPOINTS.AVION_POR_ID(avionId));
  return res.data.data ?? null;
};

// ── Escalas del vuelo ─────────────────────────────────────────────────────────
export const getEscalasPorVuelo = async (vueloId) => {
  const res = await apiClient.get(ENDPOINTS.ESCALAS_POR_VUELO(vueloId));
  return res.data.data ?? [];
};

// ── Asientos del vuelo ────────────────────────────────────────────────────────
export const getAsientosPorVuelo = async (vueloId) => {
  const res = await apiClient.get(ENDPOINTS.ASIENTOS_POR_VUELO(vueloId));
  return res.data.data ?? [];
};
