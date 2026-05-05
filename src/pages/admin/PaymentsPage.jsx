// src/pages/admin/PaymentsPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButtons from '../../components/admin/ActionButtons';

// ============================================================
// PAYMENTSPAGE
// Gestión de pagos del panel administrativo.
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '');

const RESULTADO_OPTIONS = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'APROBADA', label: 'Aprobada' },
    { value: 'RECHAZADA', label: 'Rechazada' },
    { value: 'REEMBOLSADA', label: 'Reembolsada' },
];

// ============================================================
// MODAL DETALLE
// ============================================================
const PaymentDetailModal = ({ pago, onClose }) => {
    if (!pago) return null;

    const formatCurrency = (val) => val !== undefined && val !== null
        ? new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val)
        : '—';

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div>
                        <div style={styles.modalTitle}>Pago #{pago.pagoId}</div>
                        <div style={styles.modalSub}>
                            TXN: {pago.numeroTransaccion ?? '—'}
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.grid2}>

                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>ID Pago</span>
                            <span style={styles.fieldValue}>{pago.pagoId}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Resultado</span>
                            <StatusBadge status={pago.resultado} />
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>N° Transacción</span>
                            <span style={{
                                ...styles.fieldValue,
                                fontFamily: 'var(--admin-font-mono)',
                                fontSize: '12px',
                                color: 'var(--admin-blue-action)',
                            }}>
                                {pago.numeroTransaccion ?? '—'}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Autorización Pasarela</span>
                            <span style={{
                                ...styles.fieldValue,
                                fontFamily: 'var(--admin-font-mono)',
                                fontSize: '12px',
                            }}>
                                {pago.autorizacionPasarela ?? '—'}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Reserva</span>
                            <span style={styles.fieldValue}>{pago.reservaPnr || `Reserva #${pago.reservaId}`}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Método de Pago</span>
                            <span style={styles.fieldValue}>{pago.metodoPagoNombre || `Método #${pago.metodoPagoId}`}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Subtotal</span>
                            <span style={{ ...styles.fieldValue, fontFamily: 'var(--admin-font-mono)' }}>
                                {formatCurrency(pago.subtotal)}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Impuestos</span>
                            <span style={{ ...styles.fieldValue, fontFamily: 'var(--admin-font-mono)' }}>
                                {formatCurrency(pago.impuestos)}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Cargo Servicio</span>
                            <span style={{ ...styles.fieldValue, fontFamily: 'var(--admin-font-mono)' }}>
                                {formatCurrency(pago.cargoServicio)}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Respuesta Pasarela</span>
                            <span style={{ ...styles.fieldValue, fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                                {pago.respuestaPasarela ?? '—'}
                            </span>
                        </div>

                    </div>

                    {/* Monto total destacado */}
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
                            MONTO TOTAL
                        </span>
                        <span style={{
                            fontFamily: 'var(--admin-font-mono)',
                            fontWeight: 700, fontSize: '20px',
                            color: 'var(--admin-blue-dark)',
                        }}>
                            {formatCurrency(pago.montoTotal)}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

// ============================================================
// MODAL EDITAR RESULTADO
// ============================================================
const PaymentEditModal = ({ pago, onClose, onSaved }) => {
    const { token } = useAuth();
    const [resultado, setResultado] = useState(pago?.resultado ?? 'PENDIENTE');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        try {
            setSaving(true);
            setError(null);

            const res = await fetch(`${API_BASE}/api/v1/pago/${pago.pagoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    pagoId: pago.pagoId,
                    reservaId: pago.reservaId,
                    metodoPagoId: pago.metodoPagoId,
                    numeroTransaccion: pago.numeroTransaccion,
                    resultado,
                    subtotal: pago.subtotal,
                    impuestos: pago.impuestos,
                    cargoServicio: pago.cargoServicio,
                    montoTotal: pago.montoTotal,
                    autorizacionPasarela: pago.autorizacionPasarela,
                    respuestaPasarela: pago.respuestaPasarela,
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
                        <div style={styles.modalTitle}>Editar Pago #{pago.pagoId}</div>
                        <div style={styles.modalSub}>TXN: {pago.numeroTransaccion ?? '—'}</div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.formField}>
                        <label style={styles.fieldLabel}>Resultado *</label>
                        <select
                            className="admin-input"
                            value={resultado}
                            onChange={e => setResultado(e.target.value)}
                        >
                            {RESULTADO_OPTIONS.map(opt => (
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
const PaymentsPage = () => {
    const { token } = useAuth();

    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);

    // ── Fetch: GET /api/v1/pago ─────────────────────────────
    const fetchPagos = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/pago`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            const data = json.data ?? json;

            // --- Resolver reservas y métodos de pago ---
            const reservaIds = [...new Set(data.map(p => p.reservaId).filter(Boolean))];
            const metodoIds = [...new Set(data.map(p => p.metodoPagoId).filter(Boolean))];

            const reservasPromises = reservaIds.map(async (rId) => {
                const rRes = await fetch(`${API_BASE}/api/v1/reserva/${rId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!rRes.ok) return null;
                const json = await rRes.json();
                return json.data ?? json;
            });

            const metodosPromises = metodoIds.map(async (mId) => {
                const mRes = await fetch(`${API_BASE}/api/v1/MetodoPago/${mId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!mRes.ok) return null;
                const json = await mRes.json();
                return json.data ?? json;
            });

            const [reservasData, metodosData] = await Promise.all([
                Promise.all(reservasPromises),
                Promise.all(metodosPromises)
            ]);

            const reservasMap = {};
            reservasData.filter(Boolean).forEach(r => {
                reservasMap[r.reservaId] = r.pnr;
            });

            const metodosMap = {};
            metodosData.filter(Boolean).forEach(m => {
                // Formato: "TARJETA_CREDITO - VISA ****1234" o "TRANSFERENCIA"
                let nombre = m.tipoPago;
                if (m.marca) nombre += ` - ${m.marca}`;
                if (m.ultimos4) nombre += ` ****${m.ultimos4}`;
                metodosMap[m.metodoPagoId] = nombre;
            });

            const pagosModificados = data.map(p => ({
                ...p,
                reservaPnr: reservasMap[p.reservaId] || `Reserva #${p.reservaId}`,
                metodoPagoNombre: metodosMap[p.metodoPagoId] || `Método #${p.metodoPagoId}`
            }));

            setPagos(pagosModificados);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchPagos();
    }, [token]);

    const formatCurrency = (val) => val !== undefined && val !== null
        ? new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val)
        : '—';

    // ── Columnas ────────────────────────────────────────────
    const columns = [
        {
            key: 'numeroTransaccion',
            label: 'N° Transacción',
            render: (val) => (
                <span style={{
                    fontFamily: 'var(--admin-font-mono)',
                    fontWeight: 700, fontSize: '12px',
                    color: 'var(--admin-blue-action)',
                }}>
                    {val ?? '—'}
                </span>
            ),
        },
        {
            key: 'reservaPnr',
            label: 'Reserva',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', color: 'var(--admin-text-secondary)', fontSize: '13px', fontWeight: 600 }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'metodoPagoNombre',
            label: 'Método',
            render: (val) => (
                <span style={{ color: 'var(--admin-text-secondary)', fontSize: '12px', fontWeight: 500 }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'subtotal',
            label: 'Subtotal',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontSize: '12px' }}>
                    {formatCurrency(val)}
                </span>
            ),
        },
        {
            key: 'impuestos',
            label: 'Impuestos',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                    {formatCurrency(val)}
                </span>
            ),
        },
        {
            key: 'montoTotal',
            label: 'Total',
            render: (val) => (
                <span style={{
                    fontFamily: 'var(--admin-font-mono)',
                    fontWeight: 700, fontSize: '13px',
                }}>
                    {formatCurrency(val)}
                </span>
            ),
        },
        {
            key: 'resultado',
            label: 'Resultado',
            render: (val) => <StatusBadge status={val} />,
        },
    ];

    // ── Render ──────────────────────────────────────────────
    return (
        <div>

            <div className="admin-page-header">
                <div className="admin-page-header-left">
                    <h1 className="admin-page-title">Pagos</h1>
                    <p className="admin-page-subtitle">
                        Seguimiento de transacciones y pagos del sistema
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
                    ⚠ No se pudieron cargar los pagos: {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={pagos}
                loading={loading}
                filterKey="resultado"
                filterOptions={RESULTADO_OPTIONS}
                searchPlaceholder="Buscar por N° transacción..."
                emptyText="No hay pagos registrados."
                actions={(row) => (
                    <ActionButtons
                        onView={() => setSelected(row)}
                        onEdit={() => setEditing(row)}
                    />
                )}
            />

            {selected && (
                <PaymentDetailModal
                    pago={selected}
                    onClose={() => setSelected(null)}
                />
            )}

            {editing && (
                <PaymentEditModal
                    pago={editing}
                    onClose={() => setEditing(null)}
                    onSaved={fetchPagos}
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

export default PaymentsPage;