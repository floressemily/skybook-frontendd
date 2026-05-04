// src/pages/admin/AircraftPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButtons from '../../components/admin/ActionButtons';

// ============================================================
// AIRCRAFTPAGE
// Gestión de aviones del panel administrativo.
//
// APIs usadas:
// GET  /api/v1/avion                          → lista todos
// GET  /api/v1/avion/{id}                     → detalle
// POST /api/v1/avion                          → crear
// PUT  /api/v1/avion/{id}                     → actualizar
// GET  /api/v1/avion/por-matricula/{matricula}→ buscar por matrícula
// ============================================================

const API_BASE = 'http://localhost:5100';

const ESTADO_OPTIONS = [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
    { value: 'INACTIVO', label: 'Inactivo' },
];

const FUSELAJE_OPTIONS = [
    { value: 'NARROW_BODY', label: 'Narrow Body' },
    { value: 'WIDE_BODY', label: 'Wide Body' },
    { value: 'REGIONAL', label: 'Regional' },
];

const MODELOS_AVION = [
    "Airbus A319", "Airbus A320", "Airbus A320neo",
    "ATR 72-600", "Boeing 737-800", "Boeing 787-9",
    "Embraer E190", "Cessna 208B", "DHC-6 Twin Otter"
];

const FABRICANTES = [
    "Airbus", "Boeing", "ATR", "Embraer", "Cessna", "De Havilland"
];

// ============================================================
// MODAL DETALLE
// ============================================================
const AircraftDetailModal = ({ avion, onClose }) => {
    const { token } = useAuth();
    if (!avion) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div>
                        <div style={styles.modalTitle}>
                            {avion.matricula} — {avion.modelo}
                        </div>
                        <div style={styles.modalSub}>{avion.fabricante}</div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.grid2}>

                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>ID Avión</span>
                            <span style={styles.fieldValue}>{avion.avionId}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Estado</span>
                            <StatusBadge status={avion.estado} />
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Matrícula</span>
                            <span style={{
                                ...styles.fieldValue,
                                fontFamily: 'var(--admin-font-mono)',
                                fontWeight: 700,
                                color: 'var(--admin-blue-action)',
                            }}>
                                {avion.matricula}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Modelo</span>
                            <span style={styles.fieldValue}>{avion.modelo}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Fabricante</span>
                            <span style={styles.fieldValue}>{avion.fabricante}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Tipo Fuselaje</span>
                            <span style={styles.fieldValue}>{avion.tipoFuselaje ?? '—'}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Capacidad Total</span>
                            <span style={{
                                ...styles.fieldValue,
                                fontFamily: 'var(--admin-font-mono)',
                            }}>
                                {avion.capacidadTotal} pasajeros
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Configuración</span>
                            <span style={{
                                ...styles.fieldValue,
                                fontFamily: 'var(--admin-font-mono)',
                            }}>
                                {avion.filasTotales} filas × {avion.columnasTotales} col.
                            </span>
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
const AircraftFormModal = ({ avion, onClose, onSaved }) => {
    const { token } = useAuth();
    const isEdit = !!avion;

    const [form, setForm] = useState({
        matricula: avion?.matricula ?? '',
        modelo: avion?.modelo ?? '',
        fabricante: avion?.fabricante ?? '',
        capacidadTotal: avion?.capacidadTotal ?? '',
        tipoFuselaje: avion?.tipoFuselaje ?? 'NARROW_BODY',
        filasTotales: avion?.filasTotales ?? '',
        columnasTotales: avion?.columnasTotales ?? '',
        estado: avion?.estado ?? 'ACTIVO',
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

    const handleMatriculaClick = () => {
        if (!form.matricula) {
            setForm(prev => ({ ...prev, matricula: 'HC-' }));
            if (fieldErrors.matricula) {
                setFieldErrors(prev => ({ ...prev, matricula: null }));
            }
        }
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            setError(null);
            setFieldErrors({});

            let newErrors = {};

            const mat = form.matricula ? form.matricula.toUpperCase() : '';
            if (!mat) {
                newErrors.matricula = "La matrícula es obligatoria.";
            } else if (!/^HC-[A-Z0-9]{2,6}$/.test(mat)) {
                newErrors.matricula = "La matrícula debe tener formato HC-XXX";
            }

            if (!form.modelo) {
                newErrors.modelo = "El modelo es obligatorio.";
            } else if (!/^[a-zA-Z0-9\-\s]{3,60}$/.test(form.modelo)) {
                newErrors.modelo = "Letras, números, guiones y espacios (3-60).";
            }

            if (!form.fabricante) {
                newErrors.fabricante = "El fabricante es obligatorio.";
            } else if (!/^[a-zA-Z\s]{2,40}$/.test(form.fabricante)) {
                newErrors.fabricante = "Solo letras y espacios (2-40).";
            }

            const cap = Number(form.capacidadTotal);
            if (!form.capacidadTotal) newErrors.capacidadTotal = "Obligatorio.";
            else if (!Number.isInteger(cap) || cap < 1 || cap > 500) newErrors.capacidadTotal = "Rango: 1 a 500.";

            const filas = Number(form.filasTotales);
            if (!form.filasTotales) newErrors.filasTotales = "Obligatorio.";
            else if (!Number.isInteger(filas) || filas < 1 || filas > 60) newErrors.filasTotales = "Rango: 1 a 60.";

            const col = Number(form.columnasTotales);
            if (!form.columnasTotales) newErrors.columnasTotales = "Obligatorio.";
            else if (!Number.isInteger(col) || col < 1 || col > 12) newErrors.columnasTotales = "Rango: 1 a 12.";

            if (!form.tipoFuselaje) newErrors.tipoFuselaje = "Obligatorio.";
            if (!form.estado) newErrors.estado = "Obligatorio.";

            if (Object.keys(newErrors).length > 0) {
                setFieldErrors(newErrors);
                setSaving(false);
                return;
            }

            const url = isEdit
                ? `${API_BASE}/api/v1/avion/${avion.avionId}`
                : `${API_BASE}/api/v1/avion`;

            const method = isEdit ? 'PUT' : 'POST';

            const body = {
                ...form,
                matricula: mat,
                capacidadTotal: cap,
                filasTotales: filas,
                columnasTotales: col,
            };

            if (isEdit) body.avionId = avion.avionId;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
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
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div>
                        <div style={styles.modalTitle}>
                            {isEdit ? `Editar Avión ${avion.matricula}` : 'Nuevo Avión'}
                        </div>
                        <div style={styles.modalSub}>
                            {isEdit
                                ? 'Modifica los datos del avión'
                                : 'Completa los datos para registrar un avión'}
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <datalist id="modelosList">
                        {MODELOS_AVION.map(m => <option key={m} value={m} />)}
                    </datalist>
                    <datalist id="fabricantesList">
                        {FABRICANTES.map(f => <option key={f} value={f} />)}
                    </datalist>

                    <div style={styles.grid2}>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Matrícula *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.matricula ? 'var(--admin-error)' : undefined, textTransform: 'uppercase' }}
                                type="text"
                                name="matricula"
                                value={form.matricula}
                                onChange={handleChange}
                                onClick={handleMatriculaClick}
                                placeholder="Ej: HC-ABC"
                            />
                            {fieldErrors.matricula && <span style={styles.errorText}>{fieldErrors.matricula}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Modelo *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.modelo ? 'var(--admin-error)' : undefined }}
                                type="text"
                                name="modelo"
                                list="modelosList"
                                value={form.modelo}
                                onChange={handleChange}
                                placeholder="Ej: Airbus A320"
                            />
                            {fieldErrors.modelo && <span style={styles.errorText}>{fieldErrors.modelo}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Fabricante *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.fabricante ? 'var(--admin-error)' : undefined }}
                                type="text"
                                name="fabricante"
                                list="fabricantesList"
                                value={form.fabricante}
                                onChange={handleChange}
                                placeholder="Ej: Airbus"
                            />
                            {fieldErrors.fabricante && <span style={styles.errorText}>{fieldErrors.fabricante}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Capacidad Total *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.capacidadTotal ? 'var(--admin-error)' : undefined }}
                                type="number"
                                name="capacidadTotal"
                                value={form.capacidadTotal}
                                onChange={handleChange}
                                placeholder="Ej: 180"
                                min="1" max="500"
                            />
                            {fieldErrors.capacidadTotal && <span style={styles.errorText}>{fieldErrors.capacidadTotal}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Filas Totales *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.filasTotales ? 'var(--admin-error)' : undefined }}
                                type="number"
                                name="filasTotales"
                                value={form.filasTotales}
                                onChange={handleChange}
                                placeholder="Ej: 30"
                                min="1" max="60"
                            />
                            {fieldErrors.filasTotales && <span style={styles.errorText}>{fieldErrors.filasTotales}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Columnas Totales *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.columnasTotales ? 'var(--admin-error)' : undefined }}
                                type="number"
                                name="columnasTotales"
                                value={form.columnasTotales}
                                onChange={handleChange}
                                placeholder="Ej: 6"
                                min="1" max="12"
                            />
                            {fieldErrors.columnasTotales && <span style={styles.errorText}>{fieldErrors.columnasTotales}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Tipo Fuselaje *</label>
                            <select
                                className="admin-input"
                                style={{ borderColor: fieldErrors.tipoFuselaje ? 'var(--admin-error)' : undefined }}
                                name="tipoFuselaje"
                                value={form.tipoFuselaje}
                                onChange={handleChange}
                            >
                                {FUSELAJE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.tipoFuselaje && <span style={styles.errorText}>{fieldErrors.tipoFuselaje}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Estado *</label>
                            <select
                                className="admin-input"
                                style={{ borderColor: fieldErrors.estado ? 'var(--admin-error)' : undefined }}
                                name="estado"
                                value={form.estado}
                                onChange={handleChange}
                            >
                                {ESTADO_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
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
                            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar avión'}
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
const AircraftPage = () => {
    const { token } = useAuth();

    const [aviones, setAviones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // ── Fetch: GET /api/v1/avion ────────────────────────────
    const fetchAviones = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/avion`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            setAviones(json.data ?? json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchAviones();
    }, [token]);

    // ── Columnas ────────────────────────────────────────────
    const columns = [
        {
            key: 'matricula',
            label: 'Matrícula',
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
            key: 'modelo',
            label: 'Modelo',
            render: (val) => (
                <span style={{ fontWeight: 500 }}>{val}</span>
            ),
        },
        {
            key: 'fabricante',
            label: 'Fabricante',
            render: (val) => (
                <span style={{ color: 'var(--admin-text-secondary)' }}>{val}</span>
            ),
        },
        {
            key: 'tipoFuselaje',
            label: 'Fuselaje',
            render: (val) => (
                <span style={{
                    fontSize: '11px', fontWeight: 600,
                    color: 'var(--admin-text-secondary)',
                    background: 'var(--admin-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: 'var(--admin-radius-sm)',
                    padding: '2px 8px',
                }}>
                    {val ?? '—'}
                </span>
            ),
        },
        {
            key: 'capacidadTotal',
            label: 'Capacidad',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontSize: '13px' }}>
                    {val} pax
                </span>
            ),
        },
        {
            key: 'filasTotales',
            label: 'Config.',
            render: (val, row) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                    {val} × {row.columnasTotales}
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
                    <h1 className="admin-page-title">Aviones</h1>
                    <p className="admin-page-subtitle">
                        Gestión de la flota de aeronaves
                    </p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => { setEditing(null); setShowForm(true); }}
                >
                    + Nuevo Avión
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
                    ⚠ No se pudieron cargar los aviones: {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={aviones}
                loading={loading}
                filterKey="estado"
                filterOptions={ESTADO_OPTIONS}
                searchPlaceholder="Buscar por matrícula, modelo, fabricante..."
                emptyText="No hay aviones registrados."
                actions={(row) => (
                    <ActionButtons
                        onView={() => setSelected(row)}
                        onEdit={() => { setEditing(row); setShowForm(true); }}
                    />
                )}
            />

            {selected && (
                <AircraftDetailModal
                    avion={selected}
                    onClose={() => setSelected(null)}
                />
            )}

            {showForm && (
                <AircraftFormModal
                    avion={editing}
                    onClose={() => setShowForm(false)}
                    onSaved={fetchAviones}
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
    errorText: {
        color: 'var(--admin-error)',
        fontSize: '11px',
        marginTop: '2px',
        fontWeight: 500
    }
};

export default AircraftPage;