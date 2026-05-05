// src/pages/admin/AirportsPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButtons from '../../components/admin/ActionButtons';

// ============================================================
// AIRPORTSPAGE
// Gestión de aeropuertos del panel administrativo.
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '');

const ACTIVO_OPTIONS = [
    { value: 'true', label: 'Activo' },
    { value: 'false', label: 'Inactivo' },
];

// ============================================================
// MODAL DETALLE
// ============================================================
const AirportDetailModal = ({ aeropuerto, onClose }) => {
    if (!aeropuerto) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div>
                        <div style={styles.modalTitle}>
                            {aeropuerto.codigoIATA} — {aeropuerto.nombre}
                        </div>
                        <div style={styles.modalSub}>
                            {aeropuerto.esInternacional ? '✈ Internacional' : '🛩 Nacional'}
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.grid2}>

                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>ID Aeropuerto</span>
                            <span style={styles.fieldValue}>{aeropuerto.aeropuertoId}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Estado</span>
                            <StatusBadge activo={aeropuerto.activo ? 1 : 0} />
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Nombre</span>
                            <span style={styles.fieldValue}>{aeropuerto.nombre}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Ciudad</span>
                            <span style={styles.fieldValue}>
                                {aeropuerto.ciudadNombre || `Ciudad #${aeropuerto.ciudadId}`}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Código IATA</span>
                            <span style={{
                                ...styles.fieldValue,
                                fontFamily: 'var(--admin-font-mono)',
                                fontSize: '15px',
                                fontWeight: 700,
                                color: 'var(--admin-blue-action)',
                            }}>
                                {aeropuerto.codigoIATA}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Código ICAO</span>
                            <span style={{
                                ...styles.fieldValue,
                                fontFamily: 'var(--admin-font-mono)',
                            }}>
                                {aeropuerto.codigoICAO ?? '—'}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Internacional</span>
                            <span style={styles.fieldValue}>
                                {aeropuerto.esInternacional ? 'Sí' : 'No'}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Teléfono</span>
                            <span style={styles.fieldValue}>
                                {aeropuerto.telefonoContacto ?? '—'}
                            </span>
                        </div>
                        <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                            <span style={styles.fieldLabel}>Email</span>
                            <span style={styles.fieldValue}>
                                {aeropuerto.emailContacto ?? '—'}
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
const AirportFormModal = ({ aeropuerto, ciudades, onClose, onSaved }) => {
    const { token } = useAuth();
    const isEdit = !!aeropuerto;

    const [form, setForm] = useState({
        ciudadId: aeropuerto?.ciudadId ?? '',
        nombre: aeropuerto?.nombre ?? '',
        codigoIATA: aeropuerto?.codigoIATA ?? '',
        codigoICAO: aeropuerto?.codigoICAO ?? '',
        esInternacional: aeropuerto?.esInternacional ?? true,
        telefonoContacto: aeropuerto?.telefonoContacto ?? '',
        emailContacto: aeropuerto?.emailContacto ?? '',
        activo: aeropuerto?.activo ?? true,
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            setError(null);
            setFieldErrors({});

            let newErrors = {};

            if (!form.nombre) newErrors.nombre = "El nombre es obligatorio.";
            else if (form.nombre.length < 3 || form.nombre.length > 100) newErrors.nombre = "Debe tener entre 3 y 100 caracteres.";

            if (!form.codigoIATA) newErrors.codigoIATA = "Obligatorio.";
            else if (!/^[a-zA-Z]{3}$/.test(form.codigoIATA)) newErrors.codigoIATA = "Debe ser exactamente 3 letras sin números.";

            if (form.codigoICAO && !/^[a-zA-Z]{4}$/.test(form.codigoICAO)) {
                newErrors.codigoICAO = "Debe ser exactamente 4 letras sin números.";
            }

            if (!form.ciudadId) newErrors.ciudadId = "La ciudad es obligatoria.";

            if (form.telefonoContacto && !/^(?:\+593\d{9}|0\d{9})$/.test(form.telefonoContacto)) {
                newErrors.telefonoContacto = "Debe ser +593XXXXXXXXX o 0XXXXXXXXX.";
            }

            if (form.emailContacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailContacto)) {
                newErrors.emailContacto = "Formato de email inválido.";
            }

            if (Object.keys(newErrors).length > 0) {
                setFieldErrors(newErrors);
                setSaving(false);
                return;
            }

            const url = isEdit
                ? `${API_BASE}/api/v1/aeropuerto/${aeropuerto.aeropuertoId}`
                : `${API_BASE}/api/v1/aeropuerto`;

            const method = isEdit ? 'PUT' : 'POST';

            const body = {
                ...form,
                codigoIATA: form.codigoIATA.toUpperCase(),
                codigoICAO: form.codigoICAO ? form.codigoICAO.toUpperCase() : null,
                ciudadId: Number(form.ciudadId),
                activo: form.activo === true || form.activo === 'true',
                esInternacional: false,
            };

            if (isEdit) body.aeropuertoId = aeropuerto.aeropuertoId;

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
                            {isEdit ? `Editar Aeropuerto ${aeropuerto.codigoIATA}` : 'Nuevo Aeropuerto'}
                        </div>
                        <div style={styles.modalSub}>
                            {isEdit ? 'Modifica los datos del aeropuerto' : 'Completa los datos para crear un aeropuerto'}
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.grid2}>

                        <div style={{ ...styles.formField, gridColumn: '1 / -1' }}>
                            <label style={styles.fieldLabel}>Nombre *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.nombre ? 'var(--admin-error)' : undefined }}
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Ej: José Joaquín de Olmedo"
                            />
                            {fieldErrors.nombre && <span style={styles.errorText}>{fieldErrors.nombre}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Código IATA (3 letras) *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.codigoIATA ? 'var(--admin-error)' : undefined, textTransform: 'uppercase' }}
                                type="text"
                                name="codigoIATA"
                                value={form.codigoIATA}
                                onChange={handleChange}
                                placeholder="Ej: GYE, UIO, BOG"
                                maxLength={3}
                            />
                            {fieldErrors.codigoIATA && <span style={styles.errorText}>{fieldErrors.codigoIATA}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Código ICAO (4 letras)</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.codigoICAO ? 'var(--admin-error)' : undefined, textTransform: 'uppercase' }}
                                type="text"
                                name="codigoICAO"
                                value={form.codigoICAO}
                                onChange={handleChange}
                                placeholder="Ej: SEGU, SEQU"
                                maxLength={4}
                            />
                            {fieldErrors.codigoICAO && <span style={styles.errorText}>{fieldErrors.codigoICAO}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Ciudad *</label>
                            <select
                                className="admin-input"
                                style={{ borderColor: fieldErrors.ciudadId ? 'var(--admin-error)' : undefined }}
                                name="ciudadId"
                                value={form.ciudadId}
                                onChange={handleChange}
                            >
                                <option value="">-- Seleccionar Ciudad --</option>
                                {ciudades.map(c => (
                                    <option key={c.ciudadId} value={c.ciudadId}>
                                        {c.nombrePais ? `${c.nombre}, ${c.nombrePais}` : c.nombre}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.ciudadId && <span style={styles.errorText}>{fieldErrors.ciudadId}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Teléfono Contacto</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.telefonoContacto ? 'var(--admin-error)' : undefined }}
                                type="text"
                                name="telefonoContacto"
                                value={form.telefonoContacto}
                                onChange={handleChange}
                                placeholder="Ej: +593999999999"
                            />
                            {fieldErrors.telefonoContacto && <span style={styles.errorText}>{fieldErrors.telefonoContacto}</span>}
                        </div>

                        <div style={{ ...styles.formField, gridColumn: '1 / -1' }}>
                            <label style={styles.fieldLabel}>Email Contacto</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.emailContacto ? 'var(--admin-error)' : undefined }}
                                type="email"
                                name="emailContacto"
                                value={form.emailContacto}
                                onChange={handleChange}
                                placeholder="Ej: info@aeropuerto.com"
                            />
                            {fieldErrors.emailContacto && <span style={styles.errorText}>{fieldErrors.emailContacto}</span>}
                        </div>

                        <div style={{ ...styles.formField, gridColumn: '1 / -1' }}>
                            <label style={styles.fieldLabel}>Estado</label>
                            <select
                                className="admin-input"
                                name="activo"
                                value={form.activo}
                                onChange={handleChange}
                            >
                                <option value={true}>Activo</option>
                                <option value={false}>Inactivo</option>
                            </select>
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
                            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear aeropuerto'}
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
const AirportsPage = () => {
    const { token } = useAuth();

    const [aeropuertos, setAeropuertos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [ciudades, setCiudades] = useState([]);

    const fetchCiudades = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/ciudad`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                const data = json.data ?? json;
                setCiudades(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Error cargando ciudades', e);
        }
    };

    // ── Fetch: GET /api/v1/aeropuerto ───────────────────────
    const fetchAeropuertos = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/aeropuerto`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            const data = json.data ?? json;

            // --- Resolver ciudades ---
            const ciudadIds = [...new Set(data.map(a => a.ciudadId).filter(Boolean))];

            const ciudadesPromises = ciudadIds.map(async (cId) => {
                const cRes = await fetch(`${API_BASE}/api/v1/ciudad/${cId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!cRes.ok) return null;
                const json = await cRes.json();
                return json.data ?? json;
            });

            const ciudadesData = (await Promise.all(ciudadesPromises)).filter(Boolean);

            const ciudadesMap = {};
            ciudadesData.forEach(c => {
                // Combina ciudad y país usando el NombrePais que ya viene en la respuesta de CiudadResponse
                ciudadesMap[c.ciudadId] = c.nombrePais ? `${c.nombre}, ${c.nombrePais}` : c.nombre;
            });

            const aeropuertosModificados = data.map(a => ({
                ...a,
                ciudadNombre: ciudadesMap[a.ciudadId] || `Ciudad #${a.ciudadId}`
            }));

            setAeropuertos(aeropuertosModificados);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAeropuertos();
            fetchCiudades();
        }
    }, [token]);

    // ── Columnas ────────────────────────────────────────────
    const columns = [
        {
            key: 'codigoIATA',
            label: 'IATA',
            render: (val) => (
                <span style={{
                    fontFamily: 'var(--admin-font-mono)',
                    fontWeight: 700, fontSize: '14px',
                    color: 'var(--admin-blue-action)',
                }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'codigoICAO',
            label: 'ICAO',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontSize: '12px' }}>
                    {val ?? '—'}
                </span>
            ),
        },
        {
            key: 'nombre',
            label: 'Nombre',
            render: (val) => (
                <span style={{ fontWeight: 600 }}>
                    {val}
                </span>
            )
        },
        {
            key: 'ciudadNombre',
            label: 'Ciudad / País',
            render: (val) => (
                <span style={{ color: 'var(--admin-text-secondary)', fontSize: '12px' }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'esInternacional',
            label: 'Tipo',
            render: (val) => (
                <span style={{
                    fontSize: '11px', fontWeight: 600,
                    color: val ? 'var(--admin-blue-action)' : 'var(--admin-text-secondary)',
                }}>
                    {val ? '✈ Internacional' : '🛩 Nacional'}
                </span>
            ),
        },
        {
            key: 'activo',
            label: 'Estado',
            render: (val) => <StatusBadge activo={val ? 1 : 0} />,
        },
    ];

    // ── Render ──────────────────────────────────────────────
    return (
        <div>

            <div className="admin-page-header">
                <div className="admin-page-header-left">
                    <h1 className="admin-page-title">Aeropuertos</h1>
                    <p className="admin-page-subtitle">
                        Gestión de aeropuertos del sistema
                    </p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => { setEditing(null); setShowForm(true); }}
                >
                    + Nuevo Aeropuerto
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
                    ⚠ No se pudieron cargar los aeropuertos: {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={aeropuertos}
                loading={loading}
                filterKey="activo"
                filterOptions={ACTIVO_OPTIONS}
                searchPlaceholder="Buscar por IATA, nombre..."
                emptyText="No hay aeropuertos registrados."
                actions={(row) => (
                    <ActionButtons
                        onView={() => setSelected(row)}
                        onEdit={() => { setEditing(row); setShowForm(true); }}
                    />
                )}
            />

            {selected && (
                <AirportDetailModal
                    aeropuerto={selected}
                    onClose={() => setSelected(null)}
                />
            )}

            {showForm && (
                <AirportFormModal
                    aeropuerto={editing}
                    ciudades={ciudades}
                    onClose={() => setShowForm(false)}
                    onSaved={fetchAeropuertos}
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

export default AirportsPage;