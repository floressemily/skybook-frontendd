// src/mock/mockData.js
// Usado SOLO cuando la API no responde.
// Los campos son EXACTAMENTE los que devuelven los endpoints reales.

// GET /api/v1/vuelo
export const mockVuelos = [
    {
        vueloId: 1,
        rutaId: 1,
        avionId: 1,
        numeroVuelo: 'AV101',
        aerolineaOperadora: 'Avianca',
        aerolineaComercializadora: 'Avianca',
        fechaSalida: '2025-06-10T08:30:00',
        fechaLlegadaEstimada: '2025-06-10T11:45:00',
        estado: 'Programado',
        observaciones: null,
        precioBase: 59.00,
    },
    {
        vueloId: 2,
        rutaId: 2,
        avionId: 2,
        numeroVuelo: 'LA204',
        aerolineaOperadora: 'LATAM',
        aerolineaComercializadora: 'LATAM',
        fechaSalida: '2025-06-10T10:00:00',
        fechaLlegadaEstimada: '2025-06-10T14:30:00',
        estado: 'Programado',
        observaciones: null,
        precioBase: 49.00,
    },
    {
        vueloId: 3,
        rutaId: 3,
        avionId: 3,
        numeroVuelo: 'CM310',
        aerolineaOperadora: 'Copa Airlines',
        aerolineaComercializadora: 'Copa Airlines',
        fechaSalida: '2025-06-10T06:15:00',
        fechaLlegadaEstimada: '2025-06-10T15:50:00',
        estado: 'Programado',
        observaciones: null,
        precioBase: 320.00,
    },
    {
        vueloId: 4,
        rutaId: 4,
        avionId: 4,
        numeroVuelo: 'IB745',
        aerolineaOperadora: 'Iberia',
        aerolineaComercializadora: 'Iberia',
        fechaSalida: '2025-06-10T22:00:00',
        fechaLlegadaEstimada: '2025-06-11T14:20:00',
        estado: 'Programado',
        observaciones: null,
        precioBase: 890.00,
    },
    {
        vueloId: 5,
        rutaId: 5,
        avionId: 5,
        numeroVuelo: 'JJ501',
        aerolineaOperadora: 'LATAM Brasil',
        aerolineaComercializadora: 'LATAM',
        fechaSalida: '2025-06-10T14:40:00',
        fechaLlegadaEstimada: '2025-06-10T19:10:00',
        estado: 'Programado',
        observaciones: null,
        precioBase: 210.00,
    },
];

// GET /api/v1/ruta/buscar — campos documentados
export const mockRutaBuscar = [
    {
        vueloId: 1,
        numeroVuelo: 'AV101',
        aerolineaOperadora: 'Avianca',
        fechaSalida: '2025-06-10T08:30:00',
        fechaLlegadaEstimada: '2025-06-10T11:45:00',
        avion: null,
        asientosDisponibles: null,
        origen: 'UIO',
        destino: 'GYE',
        precioBase: 59.00,
    },
    {
        vueloId: 2,
        numeroVuelo: 'LA204',
        aerolineaOperadora: 'LATAM',
        fechaSalida: '2025-06-10T10:00:00',
        fechaLlegadaEstimada: '2025-06-10T14:30:00',
        avion: null,
        asientosDisponibles: null,
        origen: 'UIO',
        destino: 'GYE',
        precioBase: 49.00,
    },
];

// GET /api/v1/escala/por-vuelo/{vueloId}
export const mockEscalas = {
    2: [
        {
            escalaId: 1,
            vueloId: 2,
            aeropuertoEscalaId: 3,
            numeroOrden: 1,
            tiempoEsperaMin: 60,
            requiereRecogerEquipaje: false,
            fechaLlegadaEstimada: '2025-06-10T11:00:00',
            fechaSalidaEstimada: '2025-06-10T12:00:00',
            estado: 'Programado',
        },
    ],
    3: [
        {
            escalaId: 2,
            vueloId: 3,
            aeropuertoEscalaId: 8,
            numeroOrden: 1,
            tiempoEsperaMin: 90,
            requiereRecogerEquipaje: false,
            fechaLlegadaEstimada: '2025-06-10T09:30:00',
            fechaSalidaEstimada: '2025-06-10T11:00:00',
            estado: 'Programado',
        },
    ],
};

// GET /api/v1/aeropuerto
export const mockAeropuertos = [
    { aeropuertoId: 1, nombre: 'Mariscal Sucre', codigoIATA: 'UIO', codigoICAO: 'SEQU', ciudadId: 1 },
    { aeropuertoId: 2, nombre: 'José Joaquín de Olmedo', codigoIATA: 'GYE', codigoICAO: 'SEGU', ciudadId: 2 },
    { aeropuertoId: 3, nombre: 'El Dorado', codigoIATA: 'BOG', codigoICAO: 'SKBO', ciudadId: 3 },
    { aeropuertoId: 4, nombre: 'Miami International', codigoIATA: 'MIA', codigoICAO: 'KMIA', ciudadId: 4 },
    { aeropuertoId: 5, nombre: 'Adolfo Suárez Barajas', codigoIATA: 'MAD', codigoICAO: 'LEMD', ciudadId: 5 },
    { aeropuertoId: 6, nombre: 'Cancún Internacional', codigoIATA: 'CUN', codigoICAO: 'MMUN', ciudadId: 6 },
    { aeropuertoId: 7, nombre: 'Jorge Chávez', codigoIATA: 'LIM', codigoICAO: 'SPIM', ciudadId: 7 },
    { aeropuertoId: 8, nombre: 'Tocumen Internacional', codigoIATA: 'PTY', codigoICAO: 'MPTO', ciudadId: 8 },
];