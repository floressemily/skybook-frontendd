// src/utils/precioUtils.js
// Calcula el precio base de un vuelo a partir de los datos de su ruta.
//
// Prioridad:
//   1. ruta.precioBase / ruta.PrecioBase  → TarifaBase almacenada en BD
//   2. Fórmula: (distanciaKm * 0.15) + (duracionMin * 0.5)  → redondeado a 2 dec
//
// La API devuelve el vuelo con rutaId pero SIN datos de ruta embebidos.
// Results.jsx carga el mapa de rutas y pasa la ruta correcta a FlightCard.

/**
 * Extrae un campo de un objeto tolerando camelCase y PascalCase.
 * Ejemplo: pick(obj, 'distanciaKm', 'DistanciaKm')
 */
const pick = (obj, camel, pascal) => {
  if (!obj) return null;
  if (obj[camel] != null) return obj[camel];
  if (obj[pascal] != null) return obj[pascal];
  return null;
};

/**
 * Obtiene el precio base de una ruta.
 * Usa precioBase directo si existe y es > 0, sino calcula con la fórmula.
 *
 * @param {object|null} ruta - RutaResponse de la API (camelCase o PascalCase).
 * @returns {number|null} Precio redondeado a 2 decimales, o null si faltan datos.
 */
export const calcularPrecio = (ruta) => {
  if (!ruta) return null;

  // 1. Usar precioBase directo de la BD (TarifaBase → PrecioBase en RutaResponse)
  const precioDirecto = pick(ruta, 'precioBase', 'PrecioBase');
  if (precioDirecto != null) {
    const n = Number(precioDirecto);
    if (!isNaN(n) && n > 0) return Math.round(n * 100) / 100;
  }

  // 2. Calcular desde distanciaKm y duracionEstimadaMin
  const distanciaKm = pick(ruta, 'distanciaKm', 'DistanciaKm');
  const duracionMin = pick(ruta, 'duracionEstimadaMin', 'DuracionEstimadaMin');

  if (distanciaKm == null || duracionMin == null) return null;

  const km  = Number(distanciaKm);
  const min = Number(duracionMin);

  if (isNaN(km) || isNaN(min) || km <= 0) return null;

  return Math.round(((km * 0.15) + (min * 0.5)) * 100) / 100;
};

