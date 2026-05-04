// src/services/cliente.service.js
// Tabla real: ventas.Cliente
// Campos: ClienteId, Nombre, Apellido, Email, PasswordHash,
//         Telefono, FechaNacimiento, Nacionalidad,
//         TipoDocumento, NumeroDocumento, Activo, FechaRegistro

import apiClient from './apiClient';

/**
 * Crear cliente — POST /api/v1/clientes
 * TipoDocumento valores: CEDULA | PASAPORTE | RUC
 * Si se envía TipoDocumento, NumeroDocumento es obligatorio.
 * TODO: PasswordHash debe hashearse en backend; por ahora se envía el valor plano.
 */
export const crearCliente = async (data) => {
    const payload = {
        Nombre: data.nombre,
        Apellido: data.apellido,
        Email: data.email,
        PasswordHash: data.password,   // TODO: hash real en backend
        Telefono: data.telefono || null,
        FechaNacimiento: data.fechaNacimiento || null,
        Nacionalidad: data.nacionalidad || null,
        TipoDocumento: data.tipoDocumento || null,
        NumeroDocumento: data.numeroDocumento || null,
        Activo: true,
    };
    const response = await apiClient.post('/clientes', payload);
    return response.data; // { success, message, data: { clienteId, ... } }
};

/**
 * GET /api/v1/clientes/{id}
 */
export const getClientePorId = async (clienteId) => {
    const response = await apiClient.get(`/clientes/${clienteId}`);
    return response.data.data;
};

/**
 * GET /api/v1/clientes/por-email?email=...
 */
export const getClientePorEmail = async (email) => {
    const response = await apiClient.get('/clientes/por-email', { params: { email } });
    return response.data.data;
};

/**
 * GET /api/v1/clientes/identificacion/{numeroDocumento}
 */
export const getClientePorDocumento = async (numeroDocumento) => {
    const response = await apiClient.get(`/clientes/identificacion/${numeroDocumento}`);
    return response.data.data;
};

/**
 * PUT /api/v1/clientes/{id}
 */
export const actualizarCliente = async (clienteId, data) => {
    const response = await apiClient.put(`/clientes/${clienteId}`, data);
    return response.data;
};