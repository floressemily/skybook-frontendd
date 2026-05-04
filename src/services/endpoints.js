const ENDPOINTS = {
  AEROPUERTOS: '/aeropuerto',
  AEROPUERTO_POR_ID: (id) => `/aeropuerto/${id}`,

  RUTAS: '/ruta',
  RUTAS_BUSCAR: '/ruta/buscar',
  RUTA_POR_ID: (id) => `/ruta/${id}`,

  VUELOS: '/vuelo',
  VUELO_POR_ID: (id) => `/vuelo/${id}`,
  VUELOS_POR_RUTA: (rutaId) => `/vuelo/por-ruta/${rutaId}`,
  VUELO_POR_NUMERO: (numeroVuelo) => `/vuelo/por-numero/${numeroVuelo}`,

  AVION_POR_ID: (id) => `/avion/${id}`,

  ESCALAS: '/escala',
  ESCALAS_POR_VUELO: (vueloId) => `/escala/por-vuelo/${vueloId}`,

  ASIENTOS: '/asientovuelo',
  ASIENTOS_POR_VUELO: (vueloId) => `/asientovuelo/por-vuelo/${vueloId}`,

  CLIENTES: '/clientes',
  CLIENTE_POR_ID: (id) => `/clientes/${id}`,
  CLIENTE_POR_DOCUMENTO: (numeroDocumento) => `/clientes/identificacion/${numeroDocumento}`,
  CLIENTE_POR_EMAIL: '/clientes/por-email',

  PASAJEROS: '/pasajero',
  PASAJERO_POR_ID: (id) => `/pasajero/${id}`,
  PASAJERO_POR_CLIENTE: (clienteId) => `/pasajero/por-cliente/${clienteId}`,
  PASAJERO_POR_DOCUMENTO: (tipoDocumento, numeroDocumento) =>
    `/pasajero/por-documento/${tipoDocumento}/${numeroDocumento}`,

  RESERVAS: '/reserva',
  RESERVA_POR_ID: (id) => `/reserva/${id}`,
  RESERVA_POR_CLIENTE: (clienteId) => `/reserva/por-cliente/${clienteId}`,
  RESERVA_POR_PNR: (pnr) => `/reserva/por-pnr/${pnr}`,

  RESERVA_PASAJERO: '/reservapasajero',
  RESERVA_PASAJERO_POR_ID: (id) => `/reservapasajero/${id}`,
  RESERVA_PASAJERO_POR_RESERVA: (reservaId) =>
    `/reservapasajero/por-reserva/${reservaId}`,

  METODO_PAGO: '/metodopago',
  METODO_PAGO_POR_CLIENTE: (clienteId) => `/metodopago/por-cliente/${clienteId}`,

  PAGOS: '/pago',
  PAGO_POR_RESERVA: (reservaId) => `/pago/por-reserva/${reservaId}`,

  BOLETOS: '/boleto',
  BOLETO_POR_RESERVA_PASAJERO: (reservaPasajeroId) =>
    `/boleto/por-reserva-pasajero/${reservaPasajeroId}`,

  FACTURAS: '/facturas',
  FACTURA_POR_NUMERO: (numeroFactura) => `/facturas/por-numero/${numeroFactura}`,

  CHECKIN: '/checkin',
  CHECKIN_POR_RESERVA_PASAJERO: (rpId) => `/checkin/por-reserva-pasajero/${rpId}`,

  PASE_ABORDAR: '/paseabordar',
  PASE_ABORDAR_POR_CHECKIN: (checkInId) => `/paseabordar/por-checkin/${checkInId}`,
};

export default ENDPOINTS;