// src/pages/admin/BookingsPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButtons from '../../components/admin/ActionButtons';

// ============================================================
// BOOKINGSPAGE
// Gestión de reservas del panel administrativo.
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '');

const ESTADO_OPTIONS = [
    { value: 'PENDIENTE_PAGO', label: 'Pendiente de pago' },
    { value: 'CONFIRMADA', label: 'Confirmada' },
    { value: 'CANCELADA', label: 'Cancelada' },
];

// ============================================================
// MODAL DETALLE
// ============================================================
const BookingDetailModal = ({ reserva, onClose }) => {
    if (!reserva) return null;

    const formatCurrency = (val) => val !== undefined && val !== null
        ? new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val)
        : '—';

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div>
                        <div style={styles.modalTitle}>Reserva #{reserva.reservaId}</div>
                        <div style={styles.modalSub}>PNR: {reserva.pnr}</div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.grid2}>

                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>ID Reserva</span>
                            <span style={styles.fieldValue}>{reserva.reservaId}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>PNR</span>
                            <span style={{
                                ...styles.fieldValue,
                                fontFamily: 'var(--admin-font-mono)',
                                fontWeight: 700,
                                color: 'var(--admin-blue-action)',
                                fontSize: '15px',
                            }}>
                                {reserva.pnr}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Cliente</span>
                            <span style={styles.fieldValue}>{reserva.clienteNombre || `Cliente #${reserva.clienteId}`}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Vuelo</span>
                            <span style={styles.fieldValue}>{reserva.vueloNumero || `Vuelo #${reserva.vueloId}`}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Estado</span>
                            <StatusBadge status={reserva.estadoReserva} />
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Tarifa Base</span>
                            <span style={{ ...styles.fieldValue, fontFamily: 'var(--admin-font-mono)' }}>
                                {formatCurrency(reserva.tarifaBase)}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Tasas</span>
                            <span style={{ ...styles.fieldValue, fontFamily: 'var(--admin-font-mono)' }}>
                                {formatCurrency(reserva.tasas)}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Descuentos</span>
                            <span style={{ ...styles.fieldValue, fontFamily: 'var(--admin-font-mono)', color: 'var(--admin-success)' }}>
                                -{formatCurrency(reserva.descuentos)}
                            </span>
                        </div>

                    </div>

                    {/* Total destacado */}
                    <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        background: 'var(--admin-blue-light)',
                        borderRadius: 'var(--admin-radius)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <span style={{ fontWeight: 700, color: 'var(--admin-blue-dark)', fontSize: '14px' }}>
                            TOTAL
                        </span>
                        <span style={{
                            fontFamily: 'var(--admin-font-mono)',
                            fontWeight: 700,
                            fontSize: '20px',
                            color: 'var(--admin-blue-dark)',
                        }}>
                            {formatCurrency(reserva.total)}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

// ============================================================
// MODAL EDITAR ESTADO
// ============================================================
const BookingEditModal = ({ reserva, onClose, onSaved }) => {
    const { token } = useAuth();
    const [estadoReserva, setEstadoReserva] = useState(reserva?.estadoReserva ?? 'PENDIENTE_PAGO');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        try {
            setSaving(true);
            setError(null);

            const res = await fetch(`${API_BASE}/api/v1/reserva/${reserva.reservaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    reservaId: reserva.reservaId,
                    clienteId: reserva.clienteId,
                    vueloId: reserva.vueloId,
                    pnr: reserva.pnr,
                    estadoReserva,
                    tarifaBase: reserva.tarifaBase,
                    tasas: reserva.tasas,
                    descuentos: reserva.descuentos,
                    total: reserva.total,
                }),
            });

            if (!res.ok) throw new Error(`Error ${res.status}`);
            onSaved();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={{ ...styles.modal, maxWidth: '420px' }} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div>
                        <div style={styles.modalTitle}>Editar Reserva #{reserva.reservaId}</div>
                        <div style={styles.modalSub}>PNR: {reserva.pnr}</div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.formField}>
                        <label style={styles.fieldLabel}>Estado de Reserva *</label>
                        <select
                            className="admin-input"
                            value={estadoReserva}
                            onChange={e => setEstadoReserva(e.target.value)}
                        >
                            {ESTADO_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div style={{
                            marginTop: '16px',
                            background: 'var(--admin-error-bg)',
                            color: 'var(--admin-error)',
                            border: '1px solid var(--admin-error)',
                            borderRadius: 'var(--admin-radius)',
                            padding: '10px 14px',
                            fontSize: '13px',
                        }}>
                            ⚠ {error}
                        </div>
                    )}

                    <div style={{
                        display: 'flex', gap: '10px',
                        justifyContent: 'flex-end', marginTop: '24px',
                    }}>
                        <button className="admin-btn admin-btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================
const BookingsPage = () => {
    const { token } = useAuth();

    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);

    // ── Fetch: GET /api/v1/reserva ──────────────────────────
    const fetchReservas = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/reserva`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            const data = json.data ?? json;

            // --- Resolver clientes y vuelos ---
            const clienteIds = [...new Set(data.map(r => r.clienteId).filter(Boolean))];
            const vueloIds = [...new Set(data.map(r => r.vueloId).filter(Boolean))];

            // Promesas de clientes
            const clientesPromises = clienteIds.map(async (cId) => {
                const cRes = await fetch(`${API_BASE}/api/v1/cliente/${cId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!cRes.ok) return null;
                const json = await cRes.json();
                return json.data ?? json;
            });

            // Promesas de vuelos
            const vuelosPromises = vueloIds.map(async (vId) => {
                const vRes = await fetch(`${API_BASE}/api/v1/vuelo/${vId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!vRes.ok) return null;
                const json = await vRes.json();
                return json.data ?? json;
            });

            // Ejecutar todo en paralelo
            const [clientesData, vuelosData] = await Promise.all([
                Promise.all(clientesPromises),
                Promise.all(vuelosPromises)
            ]);

            const clientesMap = {};
            clientesData.filter(Boolean).forEach(c => {
                clientesMap[c.clienteId] = `${c.nombre} ${c.apellido}`;
            });

            const vuelosMap = {};
            vuelosData.filter(Boolean).forEach(v => {
                vuelosMap[v.vueloId] = v.numeroVuelo;
            });

            // Actualizar reservas con los nuevos datos
            const reservasModificadas = data.map(r => ({
                ...r,
                clienteNombre: clientesMap[r.clienteId] || `Cliente #${r.clienteId}`,
                vueloNumero: vuelosMap[r.vueloId] || `Vuelo #${r.vueloId}`
            }));

            setReservas(reservasModificadas);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchReservas();
    }, [token]);

    const formatCurrency = (val) => val !== undefined && val !== null
        ? new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val)
        : '—';

    // ── Columnas ────────────────────────────────────────────
    const columns = [
        {
            key: 'pnr',
            label: 'PNR',
            render: (val) => (
                <span style={{
                    fontFamily: 'var(--admin-font-mono)',
                    fontWeight: 700, fontSize: '13px',
                    color: 'var(--admin-blue-action)',
                }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'clienteNombre',
            label: 'Cliente',
            render: (val) => (
                <span style={{ color: 'var(--admin-text-secondary)', fontSize: '12px', fontWeight: 600 }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'vueloNumero',
            label: 'Vuelo',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', color: 'var(--admin-text-secondary)', fontSize: '12px', fontWeight: 600 }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'tarifaBase',
            label: 'Tarifa Base',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontSize: '12px' }}>
                    {formatCurrency(val)}
                </span>
            ),
        },
        {
            key: 'tasas',
            label: 'Tasas',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                    {formatCurrency(val)}
                </span>
            ),
        },
        {
            key: 'total',
            label: 'Total',
            render: (val) => (
                <span style={{
                    fontFamily: 'var(--admin-font-mono)',
                    fontWeight: 700, fontSize: '13px',
                    color: 'var(--admin-text-primary)',
                }}>
                    {formatCurrency(val)}
                </span>
            ),
        },
        {
            key: 'estadoReserva',
            label: 'Estado',
            render: (val) => <StatusBadge status={val} />,
        },
    ];

    // ── Render ──────────────────────────────────────────────
    return (
        <div>

            <div className="admin-page-header">
                <div className="admin-page-header-left">
                    <h1 className="admin-page-title">Reservas</h1>
                    <p className="admin-page-subtitle">
                        Gestión y seguimiento de todas las reservas
                    </p>
                </div>
            </div>

            {error && (
                <div style={{
                    background: 'var(--admin-error-bg)',
                    color: 'var(--admin-error)',
                    border: '1px solid var(--admin-error)',
                    borderRadius: 'var(--admin-radius)',
                    padding: '10px 16px',
                    marginBottom: '20px',
                    fontSize: '13px',
                }}>
                    ⚠ No se pudieron cargar las reservas: {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={reservas}
                loading={loading}
                filterKey="estadoReserva"
                filterOptions={ESTADO_OPTIONS}
                searchPlaceholder="Buscar por PNR..."
                emptyText="No hay reservas registradas."
                actions={(row) => (
                    <ActionButtons
                        onView={() => setSelected(row)}
                        onEdit={() => setEditing(row)}
                    />
                )}
            />

            {selected && (
                <BookingDetailModal
                    reserva={selected}
                    onClose={() => setSelected(null)}
                />
            )}

            {editing && (
                <BookingEditModal
                    reserva={editing}
                    onClose={() => setEditing(null)}
                    onSaved={fetchReservas}
                />
            )}

        </div>
    );
};

// ============================================================
// ESTILOS INLINE
// ============================================================
const styles = {
    overlay: {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: '20px',
    },
    modal: {
        background: 'var(--admin-card)',
        borderRadius: 'var(--admin-radius-lg)',
        boxShadow: 'var(--admin-shadow-lg)',
        width: '100%', maxWidth: '600px',
        maxHeight: '85vh', overflow: 'auto',
    },
    modalHeader: {
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid var(--admin-border)',
    },
    modalTitle: {
        fontSize: '17px', fontWeight: 700,
        color: 'var(--admin-text-primary)',
    },
    modalSub: {
        fontSize: '12px', color: 'var(--admin-text-muted)', marginTop: '2px',
    },
    closeBtn: {
        background: 'none', border: 'none',
        fontSize: '16px', cursor: 'pointer',
        color: 'var(--admin-text-muted)', padding: '4px',
    },
    modalBody: { padding: '24px' },
    grid2: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
    },
    field: {
        display: 'flex', flexDirection: 'column', gap: '4px',
    },
    formField: {
        display: 'flex', flexDirection: 'column', gap: '6px',
    },
    fieldLabel: {
        fontSize: '11px', fontWeight: 600,
        color: 'var(--admin-text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.4px',
    },
    fieldValue: {
        fontSize: '13px', color: 'var(--admin-text-primary)', fontWeight: 500,
    },
};

export default BookingsPage;