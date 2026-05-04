// src/pages/admin/RoutesPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButtons from '../../components/admin/ActionButtons';

// ============================================================
// ROUTESPAGE
// Gestión de rutas del panel administrativo.
// ============================================================

const API_BASE = 'http://localhost:5100';

const ESTADO_OPTIONS = [
    { value: 'ACTIVA', label: 'Activa' },
    { value: 'INACTIVA', label: 'Inactiva' },
];

// ============================================================
// MODAL DETALLE
// ============================================================
const RouteDetailModal = ({ ruta, onClose }) => {
    if (!ruta) return null;

    const formatDuration = (min) => {
        if (!min) return '—';
        const h = Math.floor(min / 60);
        const m = min % 60;
        return h > 0 ? `${h}h ${m}min` : `${m}min`;
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div>
                        <div style={styles.modalTitle}>Ruta #{ruta.rutaId}</div>
                        <div style={styles.modalSub}>Detalle de la ruta</div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.grid2}>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>ID Ruta</span>
                            <span style={styles.fieldValue}>{ruta.rutaId}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Estado</span>
                            <StatusBadge status={ruta.estado} />
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Aeropuerto Origen</span>
                            <span style={styles.fieldValue}>{ruta.origenNombre || `Aeropuerto #${ruta.aeropuertoOrigenId}`}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Aeropuerto Destino</span>
                            <span style={styles.fieldValue}>{ruta.destinoNombre || `Aeropuerto #${ruta.aeropuertoDestinoId}`}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Distancia</span>
                            <span style={styles.fieldValue}>{ruta.distanciaKm ? `${ruta.distanciaKm} km` : '—'}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Duración Estimada</span>
                            <span style={styles.fieldValue}>{formatDuration(ruta.duracionEstimadaMin)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// ============================================================
// MODAL FORMULARIO — CREAR / EDITAR
// ============================================================
const RouteFormModal = ({ ruta, aeropuertos, onClose, onSaved }) => {
    const { token } = useAuth();
    const isEdit = !!ruta;

    const [form, setForm] = useState({
        aeropuertoOrigenId: ruta?.aeropuertoOrigenId ?? '',
        aeropuertoDestinoId: ruta?.aeropuertoDestinoId ?? '',
        distanciaKm: ruta?.distanciaKm ?? '',
        duracionEstimadaMin: ruta?.duracionEstimadaMin ?? '',
        estado: ruta?.estado ?? 'ACTIVA',
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            setError(null);
            setFieldErrors({});

            let newErrors = {};
            if (!form.aeropuertoOrigenId) newErrors.aeropuertoOrigenId = "Campo obligatorio.";
            if (!form.aeropuertoDestinoId) newErrors.aeropuertoDestinoId = "Campo obligatorio.";
            if (form.aeropuertoOrigenId && form.aeropuertoDestinoId && form.aeropuertoOrigenId === form.aeropuertoDestinoId) {
                newErrors.aeropuertoDestinoId = "El destino no puede ser igual al origen.";
            }
            if (!form.distanciaKm) newErrors.distanciaKm = "Campo obligatorio.";
            else if (Number(form.distanciaKm) <= 0) newErrors.distanciaKm = "Debe ser mayor a 0.";
            
            if (!form.duracionEstimadaMin) newErrors.duracionEstimadaMin = "Campo obligatorio.";
            else if (Number(form.duracionEstimadaMin) <= 0) newErrors.duracionEstimadaMin = "Debe ser mayor a 0.";

            if (!form.estado) newErrors.estado = "Campo obligatorio.";

            if (Object.keys(newErrors).length > 0) {
                setFieldErrors(newErrors);
                setSaving(false);
                return;
            }

            const url = isEdit
                ? `${API_BASE}/api/v1/ruta/${ruta.rutaId}`
                : `${API_BASE}/api/v1/ruta`;

            const method = isEdit ? 'PUT' : 'POST';

            const body = isEdit
                ? { rutaId: ruta.rutaId, ...form }
                : { ...form };

            // Convertir a números los campos numéricos
            body.aeropuertoOrigenId = Number(body.aeropuertoOrigenId);
            body.aeropuertoDestinoId = Number(body.aeropuertoDestinoId);
            body.distanciaKm = Number(body.distanciaKm);
            body.duracionEstimadaMin = Number(body.duracionEstimadaMin);

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                if (res.status === 400 && errData?.message?.includes("Ya existe una ruta")) {
                    throw new Error("Ya existe una ruta entre los aeropuertos seleccionados");
                }
                throw new Error(errData?.message || `Error ${res.status}`);
            }
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
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div>
                        <div style={styles.modalTitle}>
                            {isEdit ? `Editar Ruta #${ruta.rutaId}` : 'Nueva Ruta'}
                        </div>
                        <div style={styles.modalSub}>
                            {isEdit ? 'Modifica los datos de la ruta' : 'Completa los datos para crear una ruta'}
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.grid2}>

                        {isEdit && (
                            <div style={styles.formField}>
                                <label style={styles.fieldLabel}>ID Ruta</label>
                                <input
                                    className="admin-input"
                                    type="text"
                                    value={ruta.rutaId}
                                    readOnly
                                    disabled
                                    style={{ background: 'var(--admin-bg)', color: 'var(--admin-text-muted)' }}
                                />
                            </div>
                        )}

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Aeropuerto Origen *</label>
                            <select
                                className="admin-input"
                                style={{ borderColor: fieldErrors.aeropuertoOrigenId ? 'var(--admin-error)' : undefined }}
                                name="aeropuertoOrigenId"
                                value={form.aeropuertoOrigenId}
                                onChange={handleChange}
                            >
                                <option value="">-- Seleccionar --</option>
                                {aeropuertos.map(a => (
                                    <option key={a.aeropuertoId} value={a.aeropuertoId}>
                                        {a.codigoIATA} — {a.nombre}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.aeropuertoOrigenId && <span style={styles.errorText}>{fieldErrors.aeropuertoOrigenId}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Aeropuerto Destino *</label>
                            <select
                                className="admin-input"
                                style={{ borderColor: fieldErrors.aeropuertoDestinoId ? 'var(--admin-error)' : undefined }}
                                name="aeropuertoDestinoId"
                                value={form.aeropuertoDestinoId}
                                onChange={handleChange}
                            >
                                <option value="">-- Seleccionar --</option>
                                {aeropuertos.map(a => (
                                    <option key={a.aeropuertoId} value={a.aeropuertoId}>
                                        {a.codigoIATA} — {a.nombre}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.aeropuertoDestinoId && <span style={styles.errorText}>{fieldErrors.aeropuertoDestinoId}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Distancia (km) *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.distanciaKm ? 'var(--admin-error)' : undefined }}
                                type="number"
                                name="distanciaKm"
                                value={form.distanciaKm}
                                onChange={handleChange}
                                placeholder="Ej: 270"
                                min="1"
                            />
                            {fieldErrors.distanciaKm && <span style={styles.errorText}>{fieldErrors.distanciaKm}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Duración Estimada (min) *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.duracionEstimadaMin ? 'var(--admin-error)' : undefined }}
                                type="number"
                                name="duracionEstimadaMin"
                                value={form.duracionEstimadaMin}
                                onChange={handleChange}
                                placeholder="Ej: 65"
                                min="1"
                            />
                            {fieldErrors.duracionEstimadaMin && <span style={styles.errorText}>{fieldErrors.duracionEstimadaMin}</span>}
                        </div>

                        <div style={{ ...styles.formField, gridColumn: '1 / -1' }}>
                            <label style={styles.fieldLabel}>Estado *</label>
                            <select
                                className="admin-input"
                                name="estado"
                                value={form.estado}
                                onChange={handleChange}
                            >
                                <option value="ACTIVA">Activa</option>
                                <option value="INACTIVA">Inactiva</option>
                            </select>
                            {fieldErrors.estado && <span style={styles.errorText}>{fieldErrors.estado}</span>}
                        </div>

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

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <button className="admin-btn admin-btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear ruta'}
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
const RoutesPage = () => {
    const { token } = useAuth();

    const [rutas, setRutas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRuta, setSelectedRuta] = useState(null);
    const [editingRuta, setEditingRuta] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [aeropuertos, setAeropuertos] = useState([]);

    const fetchAeropuertos = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/aeropuerto`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                setAeropuertos(json.data ?? json);
            }
        } catch (e) {
            console.error('Error cargando aeropuertos', e);
        }
    };

    // ── Fetch: GET /api/v1/ruta ─────────────────────────────
    const fetchRutas = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/ruta`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            const data = json.data ?? json;

            // --- Resolver aeropuertos (IATA y nombre) ---
            const airportIds = new Set();
            data.forEach(r => {
                if (r.aeropuertoOrigenId) airportIds.add(r.aeropuertoOrigenId);
                if (r.aeropuertoDestinoId) airportIds.add(r.aeropuertoDestinoId);
            });

            const airportsPromises = [...airportIds].map(async (aId) => {
                const aRes = await fetch(`${API_BASE}/api/v1/aeropuerto/${aId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!aRes.ok) return null;
                const json = await aRes.json();
                return json.data ?? json;
            });

            const airportsData = (await Promise.all(airportsPromises)).filter(Boolean);

            const airportsMap = {};
            airportsData.forEach(a => {
                airportsMap[a.aeropuertoId] = `${a.codigoIATA} — ${a.nombre}`;
            });

            const rutasModificadas = data.map(r => ({
                ...r,
                origenNombre: airportsMap[r.aeropuertoOrigenId] || `Aeropuerto #${r.aeropuertoOrigenId}`,
                destinoNombre: airportsMap[r.aeropuertoDestinoId] || `Aeropuerto #${r.aeropuertoDestinoId}`
            }));

            setRutas(rutasModificadas);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchRutas();
            fetchAeropuertos();
        }
    }, [token]);

    const formatDuration = (min) => {
        if (!min) return '—';
        const h = Math.floor(min / 60);
        const m = min % 60;
        return h > 0 ? `${h}h ${m}min` : `${m}min`;
    };

    // ── Columnas ────────────────────────────────────────────
    const columns = [
        {
            key: 'rutaId',
            label: 'ID',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontWeight: 600 }}>
                    #{val}
                </span>
            ),
        },
        {
            key: 'origenNombre',
            label: 'Origen',
            render: (val) => (
                <span style={{ color: 'var(--admin-blue-action)', fontSize: '12px', fontWeight: 600 }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'destinoNombre',
            label: 'Destino',
            render: (val) => (
                <span style={{ color: 'var(--admin-blue-action)', fontSize: '12px', fontWeight: 600 }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'distanciaKm',
            label: 'Distancia',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontSize: '12px' }}>
                    {val ? `${val} km` : '—'}
                </span>
            ),
        },
        {
            key: 'duracionEstimadaMin',
            label: 'Duración',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontSize: '12px' }}>
                    {formatDuration(val)}
                </span>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (val) => <StatusBadge status={val} />,
        },
    ];

    // ── Render ──────────────────────────────────────────────
    return (
        <div>

            <div className="admin-page-header">
                <div className="admin-page-header-left">
                    <h1 className="admin-page-title">Rutas</h1>
                    <p className="admin-page-subtitle">
                        Gestión de rutas entre aeropuertos
                    </p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => { setEditingRuta(null); setShowForm(true); }}
                >
                    + Nueva Ruta
                </button>
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
                    ⚠ No se pudieron cargar las rutas: {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={rutas}
                loading={loading}
                filterKey="estado"
                filterOptions={ESTADO_OPTIONS}
                searchPlaceholder="Buscar por ID de ruta..."
                emptyText="No hay rutas registradas."
                actions={(row) => (
                    <ActionButtons
                        onView={() => setSelectedRuta(row)}
                        onEdit={() => { setEditingRuta(row); setShowForm(true); }}
                    />
                )}
            />

            {/* Modal detalle */}
            {selectedRuta && (
                <RouteDetailModal
                    ruta={selectedRuta}
                    onClose={() => setSelectedRuta(null)}
                />
            )}

            {/* Modal formulario crear/editar */}
            {showForm && (
                <RouteFormModal
                    ruta={editingRuta}
                    aeropuertos={aeropuertos}
                    onClose={() => setShowForm(false)}
                    onSaved={fetchRutas}
                />
            )}

        </div>
    );
};

// ============================================================
// ESTILOS INLINE DEL MODAL
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
        width: '100%', maxWidth: '580px',
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
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
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
    errorText: {
        color: 'var(--admin-error)',
        fontSize: '11px',
        marginTop: '2px',
        fontWeight: 500
    }
};

export default RoutesPage;