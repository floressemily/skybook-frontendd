// src/components/admin/StatusBadge.jsx

import '../../styles/admin/tables.css';

// ============================================================
// STATUSBADGE — Estados reales del sistema
// Uso: <StatusBadge status="PROGRAMADO" />
//      <StatusBadge activo={1} />
//      <StatusBadge role="ADMIN" />
// ============================================================

// -- Vuelos (campo: estado) --
const FLIGHT_STATUS = {
    PROGRAMADO: { variant: 'info', label: 'Programado' },
    RETRASADO: { variant: 'warning', label: 'Retrasado' },
    CANCELADO: { variant: 'error', label: 'Cancelado' },
    COMPLETADO: { variant: 'success', label: 'Completado' },
};

// -- Reservas (campo: estadoReserva) --
const BOOKING_STATUS = {
    PENDIENTE_PAGO: { variant: 'warning', label: 'Pendiente de pago' },
    CONFIRMADA: { variant: 'success', label: 'Confirmada' },
    CANCELADA: { variant: 'error', label: 'Cancelada' },
};

// -- Pagos (campo: resultado) --
const PAYMENT_STATUS = {
    PENDIENTE: { variant: 'warning', label: 'Pendiente' },
    APROBADA: { variant: 'success', label: 'Aprobada' },
    RECHAZADA: { variant: 'error', label: 'Rechazada' },
    REEMBOLSADA: { variant: 'neutral', label: 'Reembolsada' },
};

// -- Aviones (campo: estado) --
const AIRCRAFT_STATUS = {
    ACTIVO: { variant: 'success', label: 'Activo' },
    MANTENIMIENTO: { variant: 'warning', label: 'Mantenimiento' },
    INACTIVO: { variant: 'neutral', label: 'Inactivo' },
};

// -- Roles (tabla: Rol, campo: nombre) --
const ROLE_MAP = {
    ADMIN: { variant: 'dark', label: 'Admin' },
    OPERADOR: { variant: 'info', label: 'Operador' },
};

// Unificamos todos los mapas de status en uno solo
const ALL_STATUS = {
    ...FLIGHT_STATUS,
    ...BOOKING_STATUS,
    ...PAYMENT_STATUS,
    ...AIRCRAFT_STATUS,
};

// ============================================================

const StatusBadge = ({ status, activo, role }) => {
    let variant = 'neutral';
    let label = '—';

    // Booleano activo/inactivo (Clientes y Usuarios)
    // Campo activo: 1 = activo, 0 = inactivo
    if (activo !== undefined && activo !== null) {
        variant = activo === 1 || activo === true ? 'success' : 'neutral';
        label = activo === 1 || activo === true ? 'Activo' : 'Inactivo';
        return (
            <span className={`admin-badge admin-badge--${variant}`}>
                <span className="admin-badge__dot" />
                {label}
            </span>
        );
    }

    // Roles
    if (role) {
        const mapped = ROLE_MAP[role];
        if (mapped) {
            variant = mapped.variant;
            label = mapped.label;
        } else {
            label = role;
        }
        return (
            <span className={`admin-badge admin-badge--${variant}`}>
                <span className="admin-badge__dot" />
                {label}
            </span>
        );
    }

    // Todos los demás status por texto
    if (status) {
        const mapped = ALL_STATUS[status];
        if (mapped) {
            variant = mapped.variant;
            label = mapped.label;
        } else {
            label = status;
        }
    }

    return (
        <span className={`admin-badge admin-badge--${variant}`}>
            <span className="admin-badge__dot" />
            {label}
        </span>
    );
};

export default StatusBadge;