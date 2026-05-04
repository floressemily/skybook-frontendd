// src/utils/validators.js

export const validarEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? '' : 'Correo electrónico inválido';
};

export const validarCedulaEcuador = (cedula) => {
  if (!cedula || cedula.length !== 10) return 'La cédula debe tener 10 dígitos';
  if (!/^\d+$/.test(cedula)) return 'La cédula solo debe contener números';
  return '';
};

export const validarRequerido = (value, campo = 'Este campo') => {
  if (!value || String(value).trim() === '') return `${campo} es requerido`;
  return '';
};

export const validarTelefono = (telefono) => {
  if (!telefono || telefono.length < 7) return 'Teléfono inválido';
  return '';
};

export const validarFechaFutura = (fecha) => {
  if (!fecha) return 'Fecha requerida';
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (new Date(fecha) < hoy) return 'La fecha no puede ser en el pasado';
  return '';
};