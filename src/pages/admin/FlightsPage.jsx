// src/pages/admin/FlightsPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButtons from '../../components/admin/ActionButtons';

// ============================================================
// FLIGHTSPAGE
// Gestión de vuelos del panel administrativo.
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '');

// Opciones del filtro de estado (valores reales de la BD)
const ESTADO_OPTIONS = [
    { value: 'PROGRAMADO', label: 'Programado' },
    { value: 'RETRASADO', label: 'Retrasado' },
    { value: 'CANCELADO', label: 'Cancelado' },
    { value: 'COMPLETADO', label: 'Completado' },
];

// ============================================================
// MODAL DETALLE
// ============================================================
const FlightDetailModal = ({ vuelo, onClose }) => {
    if (!vuelo) return null;

    const formatDate = (val) => val
        ? new Date(val).toLocaleString('es-EC')
        : '—';

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div>
                        <div style={styles.modalTitle}>Vuelo {vuelo.numeroVuelo}</div>
                        <div style={styles.modalSub}>{vuelo.aerolineaOperadora}</div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.grid2}>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>ID Vuelo</span>
                            <span style={styles.fieldValue}>{vuelo.vueloId}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Número de Vuelo</span>
                            <span style={styles.fieldValue}>{vuelo.numeroVuelo}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Aerolínea Operadora</span>
                            <span style={styles.fieldValue}>{vuelo.aerolineaOperadora}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Aerolínea Comercializadora</span>
                            <span style={styles.fieldValue}>{vuelo.aerolineaComercializadora}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Ruta</span>
                            <span style={styles.fieldValue}>{vuelo.rutaNombre || `Ruta #${vuelo.rutaId}`}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Avión ID</span>
                            <span style={styles.fieldValue}>{vuelo.avionId}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Fecha Salida</span>
                            <span style={styles.fieldValue}>{formatDate(vuelo.fechaSalida)}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Llegada Estimada</span>
                            <span style={styles.fieldValue}>{formatDate(vuelo.fechaLlegadaEstimada)}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Salida Real</span>
                            <span style={styles.fieldValue}>{formatDate(vuelo.fechaSalidaReal)}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Llegada Real</span>
                            <span style={styles.fieldValue}>{formatDate(vuelo.fechaLlegadaReal)}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Estado</span>
                            <StatusBadge status={vuelo.estado} />
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Observaciones</span>
                            <span style={styles.fieldValue}>{vuelo.observaciones ?? '—'}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const AEROLINEAS = [
    "LATAM", "Avianca", "Copa Airlines", "Iberia", "American Airlines",
    "KLM", "Air France", "United Airlines", "Delta", "Aeroregional"
];

// ============================================================
// MODAL FORMULARIO (CREAR/EDITAR)
// ============================================================
const FlightFormModal = ({ vuelo, isEdit, rutas, aviones, onClose, onSave, token }) => {
    const [formData, setFormData] = useState({
        vueloId: vuelo?.vueloId || '',
        numeroVuelo: vuelo?.numeroVuelo || '',
        aerolineaOperadora: vuelo?.aerolineaOperadora || '',
        aerolineaComercializadora: vuelo?.aerolineaComercializadora || '',
        fechaSalida: vuelo?.fechaSalida ? new Date(vuelo.fechaSalida).toISOString().slice(0, 16) : '',
        fechaLlegadaEstimada: vuelo?.fechaLlegadaEstimada ? new Date(vuelo.fechaLlegadaEstimada).toISOString().slice(0, 16) : '',
        rutaId: vuelo?.rutaId || '',
        avionId: vuelo?.avionId || '',
        estado: vuelo?.estado || 'PROGRAMADO',
        observaciones: vuelo?.observaciones || ''
    });
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field error when typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        
        let newErrors = {};

        // 3. numeroVuelo
        if (!formData.numeroVuelo) {
            newErrors.numeroVuelo = "El número de vuelo es obligatorio.";
        } else if (!/^[a-zA-Z]{2}\d{3,4}$/.test(formData.numeroVuelo)) {
            newErrors.numeroVuelo = "Formato inválido. Ej: EC0029";
        }

        // 1. aerolineaOperadora y aerolineaComercializadora
        const validateAerolinea = (val) => {
            if (!val) return "Campo obligatorio.";
            if (val.length < 2 || val.length > 50) return "Debe tener entre 2 y 50 caracteres.";
            if (!/^[a-zA-Z\s\-]+$/.test(val)) return "Solo letras, espacios y guiones.";
            return null;
        };

        const opErr = validateAerolinea(formData.aerolineaOperadora);
        if (opErr) newErrors.aerolineaOperadora = opErr;

        const comErr = validateAerolinea(formData.aerolineaComercializadora);
        if (comErr) newErrors.aerolineaComercializadora = comErr;

        // 2. observaciones
        if (formData.observaciones && formData.observaciones.length > 0) {
            if (formData.observaciones.trim() === '') {
                newErrors.observaciones = "No puede contener solo espacios en blanco.";
            } else if (formData.observaciones.length > 80) {
                newErrors.observaciones = "Máximo 80 caracteres.";
            }
        }

        if (!formData.fechaSalida) newErrors.fechaSalida = "Campo obligatorio.";
        if (!formData.fechaLlegadaEstimada) newErrors.fechaLlegadaEstimada = "Campo obligatorio.";
        if (!formData.rutaId) newErrors.rutaId = "Campo obligatorio.";
        if (!formData.avionId) newErrors.avionId = "Campo obligatorio.";
        if (!formData.estado) newErrors.estado = "Campo obligatorio.";

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setSaving(true);
        try {
            const url = isEdit ? `${API_BASE}/api/v1/vuelo/${formData.vueloId}` : `${API_BASE}/api/v1/vuelo`;
            const method = isEdit ? 'PUT' : 'POST';
            
            const payload = { ...formData };
            if (!isEdit) {
                delete payload.vueloId;
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || `Error ${res.status}: ${res.statusText}`);
            }

            onSave();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={{...styles.modal, maxWidth: '700px'}} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <div style={styles.modalTitle}>{isEdit ? 'Editar Vuelo' : 'Nuevo Vuelo'}</div>
                    <button style={styles.closeBtn} onClick={onClose} disabled={saving}>✕</button>
                </div>
                <div style={styles.modalBody}>
                    {error && (
                        <div style={{ color: 'var(--admin-error)', background: 'var(--admin-error-bg)', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px' }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} style={styles.grid2} noValidate>
                        <datalist id="aerolineasList">
                            {AEROLINEAS.map(a => <option key={a} value={a} />)}
                        </datalist>

                        {isEdit && (
                            <div style={styles.field}>
                                <label style={styles.fieldLabel}>ID Vuelo</label>
                                <input style={styles.input} type="text" name="vueloId" value={formData.vueloId} readOnly />
                            </div>
                        )}
                        <div style={styles.field}>
                            <label style={styles.fieldLabel}>Número de Vuelo *</label>
                            <input style={{...styles.input, borderColor: fieldErrors.numeroVuelo ? 'var(--admin-error)' : 'var(--admin-border)'}} 
                                   type="text" name="numeroVuelo" value={formData.numeroVuelo} onChange={handleChange} placeholder="Ej: EC0029" required />
                            {fieldErrors.numeroVuelo && <span style={styles.errorText}>{fieldErrors.numeroVuelo}</span>}
                        </div>
                        <div style={styles.field}>
                            <label style={styles.fieldLabel}>Aerolínea Operadora *</label>
                            <input style={{...styles.input, borderColor: fieldErrors.aerolineaOperadora ? 'var(--admin-error)' : 'var(--admin-border)'}} 
                                   type="text" name="aerolineaOperadora" list="aerolineasList" value={formData.aerolineaOperadora} onChange={handleChange} required />
                            {fieldErrors.aerolineaOperadora && <span style={styles.errorText}>{fieldErrors.aerolineaOperadora}</span>}
                        </div>
                        <div style={styles.field}>
                            <label style={styles.fieldLabel}>Aerol. Comercializadora *</label>
                            <input style={{...styles.input, borderColor: fieldErrors.aerolineaComercializadora ? 'var(--admin-error)' : 'var(--admin-border)'}} 
                                   type="text" name="aerolineaComercializadora" list="aerolineasList" value={formData.aerolineaComercializadora} onChange={handleChange} required />
                            {fieldErrors.aerolineaComercializadora && <span style={styles.errorText}>{fieldErrors.aerolineaComercializadora}</span>}
                        </div>
                        <div style={styles.field}>
                            <label style={styles.fieldLabel}>Fecha Salida *</label>
                            <input style={{...styles.input, borderColor: fieldErrors.fechaSalida ? 'var(--admin-error)' : 'var(--admin-border)'}} 
                                   type="datetime-local" name="fechaSalida" value={formData.fechaSalida} onChange={handleChange} required />
                            {fieldErrors.fechaSalida && <span style={styles.errorText}>{fieldErrors.fechaSalida}</span>}
                        </div>
                        <div style={styles.field}>
                            <label style={styles.fieldLabel}>Fecha Llegada Est. *</label>
                            <input style={{...styles.input, borderColor: fieldErrors.fechaLlegadaEstimada ? 'var(--admin-error)' : 'var(--admin-border)'}} 
                                   type="datetime-local" name="fechaLlegadaEstimada" value={formData.fechaLlegadaEstimada} onChange={handleChange} required />
                            {fieldErrors.fechaLlegadaEstimada && <span style={styles.errorText}>{fieldErrors.fechaLlegadaEstimada}</span>}
                        </div>
                        <div style={styles.field}>
                            <label style={styles.fieldLabel}>Ruta *</label>
                            <select style={{...styles.input, borderColor: fieldErrors.rutaId ? 'var(--admin-error)' : 'var(--admin-border)'}} 
                                    name="rutaId" value={formData.rutaId} onChange={handleChange} required>
                                <option value="">-- Seleccionar --</option>
                                {rutas.map(r => (
                                    <option key={r.rutaId} value={r.rutaId}>{r.origen} → {r.destino}</option>
                                ))}
                            </select>
                            {fieldErrors.rutaId && <span style={styles.errorText}>{fieldErrors.rutaId}</span>}
                        </div>
                        <div style={styles.field}>
                            <label style={styles.fieldLabel}>Avión *</label>
                            <select style={{...styles.input, borderColor: fieldErrors.avionId ? 'var(--admin-error)' : 'var(--admin-border)'}} 
                                    name="avionId" value={formData.avionId} onChange={handleChange} required>
                                <option value="">-- Seleccionar --</option>
                                {aviones.map(a => (
                                    <option key={a.avionId} value={a.avionId}>{a.matricula} - {a.modelo}</option>
                                ))}
                            </select>
                            {fieldErrors.avionId && <span style={styles.errorText}>{fieldErrors.avionId}</span>}
                        </div>
                        <div style={styles.field}>
                            <label style={styles.fieldLabel}>Estado *</label>
                            <select style={{...styles.input, borderColor: fieldErrors.estado ? 'var(--admin-error)' : 'var(--admin-border)'}} 
                                    name="estado" value={formData.estado} onChange={handleChange} required>
                                <option value="PROGRAMADO">Programado</option>
                                <option value="RETRASADO">Retrasado</option>
                                <option value="CANCELADO">Cancelado</option>
                                <option value="COMPLETADO">Completado</option>
                            </select>
                            {fieldErrors.estado && <span style={styles.errorText}>{fieldErrors.estado}</span>}
                        </div>
                        <div style={{...styles.field, gridColumn: '1 / -1'}}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={styles.fieldLabel}>Observaciones</label>
                                <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
                                    {80 - (formData.observaciones?.length || 0)} caracteres restantes
                                </span>
                            </div>
                            <textarea style={{...styles.input, resize: 'vertical', minHeight: '60px', borderColor: fieldErrors.observaciones ? 'var(--admin-error)' : 'var(--admin-border)'}} 
                                      name="observaciones" value={formData.observaciones} onChange={handleChange} maxLength={80} />
                            {fieldErrors.observaciones && <span style={styles.errorText}>{fieldErrors.observaciones}</span>}
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                            <button type="button" onClick={onClose} style={{...styles.btn, background: 'var(--admin-surface)', color: 'var(--admin-text-primary)', border: '1px solid var(--admin-border)'}} disabled={saving}>Cancelar</button>
                            <button type="submit" style={{...styles.btn, background: 'var(--admin-blue-action)', color: 'white'}} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================
const FlightsPage = () => {
    const { token } = useAuth();

    const [vuelos, setVuelos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVuelo, setSelectedVuelo] = useState(null);

    const [formState, setFormState] = useState({ open: false, isEdit: false, vuelo: null });
    const [rutas, setRutas] = useState([]);
    const [aviones, setAviones] = useState([]);
    const [dependenciesLoaded, setDependenciesLoaded] = useState(false);

    const loadDependencies = async () => {
        if (dependenciesLoaded) return;
        try {
            const [rRes, aRes, airRes] = await Promise.all([
                fetch(`${API_BASE}/api/v1/ruta`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/api/v1/avion`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/api/v1/aeropuerto`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const [rData, aData, airData] = await Promise.all([rRes.json(), aRes.json(), airRes.json()]);
            
            const rList = rData.data ?? rData;
            const aList = aData.data ?? aData;
            const airList = airData.data ?? airData;
            
            const airMap = {};
            if (Array.isArray(airList)) {
                airList.forEach(a => { airMap[a.aeropuertoId] = a.codigoIATA; });
            }
            
            if (Array.isArray(rList)) {
                setRutas(rList.map(r => ({
                    rutaId: r.rutaId,
                    origen: airMap[r.aeropuertoOrigenId] || '???',
                    destino: airMap[r.aeropuertoDestinoId] || '???'
                })));
            }
            if (Array.isArray(aList)) {
                setAviones(aList);
            }
            setDependenciesLoaded(true);
        } catch (err) {
            console.error('Error loading form dependencies', err);
        }
    };

    const handleOpenForm = async (vuelo = null) => {
        await loadDependencies();
        setFormState({ open: true, isEdit: !!vuelo, vuelo });
    };

    // ── Fetch: GET /api/v1/vuelo ────────────────────────────
    const fetchVuelos = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/vuelo`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            const data = json.data ?? json;

            // --- Resolver rutas y códigos IATA ---
            const uniqueRutaIds = [...new Set(data.map(v => v.rutaId).filter(Boolean))];

            const routesPromises = uniqueRutaIds.map(async (rutaId) => {
                const rRes = await fetch(`${API_BASE}/api/v1/ruta/${rutaId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!rRes.ok) return null;
                const json = await rRes.json();
                return json.data ?? json;
            });
            const routesData = (await Promise.all(routesPromises)).filter(Boolean);

            const airportIds = new Set();
            routesData.forEach(r => {
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
                airportsMap[a.aeropuertoId] = a.codigoIATA;
            });

            const routeMap = {};
            routesData.forEach(r => {
                const orig = airportsMap[r.aeropuertoOrigenId] || '???';
                const dest = airportsMap[r.aeropuertoDestinoId] || '???';
                routeMap[r.rutaId] = `${orig} → ${dest}`;
            });

            const vuelosModificados = data.map(v => ({
                ...v,
                rutaNombre: routeMap[v.rutaId] || `Ruta #${v.rutaId}`
            }));

            setVuelos(vuelosModificados);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchVuelos();
    }, [token]);

    // ── Formateo de fecha corta ──────────────────────────────
    const formatDate = (val) => val
        ? new Date(val).toLocaleString('es-EC', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
        : '—';

    // ── Columnas de la tabla ────────────────────────────────
    const columns = [
        {
            key: 'numeroVuelo',
            label: 'N° Vuelo',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontWeight: 600 }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'aerolineaOperadora',
            label: 'Aerolínea',
        },
        {
            key: 'rutaNombre',
            label: 'Ruta',
            render: (val) => (
                <span style={{ color: 'var(--admin-blue-action)', fontSize: '13px', fontWeight: 600 }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'fechaSalida',
            label: 'Salida',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontSize: '12px' }}>
                    {formatDate(val)}
                </span>
            ),
        },
        {
            key: 'fechaLlegadaEstimada',
            label: 'Llegada Est.',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontSize: '12px' }}>
                    {formatDate(val)}
                </span>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (val) => <StatusBadge status={val} />,
        },
        {
            key: 'observaciones',
            label: 'Observaciones',
            render: (val) => (
                <span style={{ color: 'var(--admin-text-muted)', fontSize: '12px' }}>
                    {val ?? '—'}
                </span>
            ),
        },
    ];

    // ── Render ──────────────────────────────────────────────
    return (
        <div>

            <div className="admin-page-header">
                <div className="admin-page-header-left">
                    <h1 className="admin-page-title">Vuelos</h1>
                    <p className="admin-page-subtitle">
                        Gestión y seguimiento de todos los vuelos
                    </p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => handleOpenForm()}>
                    + Nuevo Vuelo
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
                    ⚠ No se pudieron cargar los vuelos: {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={vuelos}
                loading={loading}
                filterKey="estado"
                filterOptions={ESTADO_OPTIONS}
                searchPlaceholder="Buscar por número de vuelo, aerolínea..."
                emptyText="No hay vuelos registrados."
                actions={(row) => (
                    <ActionButtons
                        onView={() => setSelectedVuelo(row)}
                        onEdit={() => handleOpenForm(row)}
                    />
                )}
            />

            <FlightDetailModal
                vuelo={selectedVuelo}
                onClose={() => setSelectedVuelo(null)}
            />

            {formState.open && (
                <FlightFormModal
                    vuelo={formState.vuelo}
                    isEdit={formState.isEdit}
                    rutas={rutas}
                    aviones={aviones}
                    onClose={() => setFormState({ open: false, isEdit: false, vuelo: null })}
                    onSave={() => fetchVuelos()}
                    token={token}
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
        zIndex: 200,
        padding: '20px',
    },
    modal: {
        background: 'var(--admin-card)',
        borderRadius: 'var(--admin-radius-lg)',
        boxShadow: 'var(--admin-shadow-lg)',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '85vh',
        overflow: 'auto',
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
        color: 'var(--admin-text-muted)',
        padding: '4px',
    },
    modalBody: {
        padding: '24px',
    },
    grid2: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    field: {
        display: 'flex', flexDirection: 'column', gap: '4px',
    },
    fieldLabel: {
        fontSize: '11px', fontWeight: 600,
        color: 'var(--admin-text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.4px',
    },
    fieldValue: {
        fontSize: '13px', color: 'var(--admin-text-primary)', fontWeight: 500,
    },
    input: {
        width: '100%',
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid var(--admin-border)',
        background: 'var(--admin-surface)',
        color: 'var(--admin-text-primary)',
        fontSize: '13px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    btn: {
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    errorText: {
        color: 'var(--admin-error)',
        fontSize: '11px',
        marginTop: '2px',
        fontWeight: 500
    }
};

export default FlightsPage;