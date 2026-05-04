// src/utils/formatters.js

/**
 * Formatea un precio en USD
 * @param {number} amount
 * @returns {string} "$1,234.50"
 */
export const formatPrecio = (amount) => {
  if (amount == null) return '$0.00';
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Formatea una fecha ISO a formato legible
 * @param {string} isoString
 * @returns {string} "lun. 12 may. 2025"
 */
export const formatFecha = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('es-EC', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Formatea hora desde un string ISO
 * @param {string} isoString
 * @returns {string} "14:35"
 */
export const formatHora = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Calcula duración entre dos fechas ISO
 * @param {string} inicio
 * @param {string} fin
 * @returns {string} "2h 35m"
 */
export const calcularDuracion = (inicio, fin) => {
  if (!inicio || !fin) return '';
  const diff = new Date(fin) - new Date(inicio);
  const horas = Math.floor(diff / (1000 * 60 * 60));
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${horas}h ${minutos}m`;
};