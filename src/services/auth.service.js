// src/services/auth.service.js
// Endpoint real: POST /api/v1/auth/login
// Soporta UsuarioApp (seg.UsuarioApp).
// Si en el futuro se agrega login de Cliente: POST /api/v1/auth/login-cliente
// TODO: agregar login-cliente cuando el backend lo exponga.

import apiClient from './apiClient';

/**
 * Login con UsuarioApp (seg.UsuarioApp)
 * @param {string} userName  - email o nombre de usuario
 * @param {string} password
 * @returns {object} data del backend: token, usuario, etc.
 */
export const login = async (userName, password) => {
    const response = await apiClient.post('/auth/login', {
        userName,
        password,
    });
    // response.data.data según el wrapper { success, message, data }
    return response.data;
};

/**
 * Placeholder para login de Cliente cuando el backend lo implemente.
 * NO llamar todavía — el endpoint no existe.
 * TODO: descomentar cuando backend exponga POST /api/v1/auth/login-cliente
 */
// export const loginCliente = async (email, password) => {
//   const response = await apiClient.post('/auth/login-cliente', { email, password });
//   return response.data;
// };