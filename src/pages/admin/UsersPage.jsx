// src/pages/admin/UsersPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButtons from '../../components/admin/ActionButtons';

// ============================================================
// USERSPAGE
// Gestión de usuarios administrativos del panel.
//
// APIs usadas:
// GET  /api/v1/usuarioapp                          → lista usuarios
// GET  /api/v1/usuarioapp/{id}                     → detalle
// POST /api/v1/usuarioapp                          → crear
// PUT  /api/v1/usuarioapp/{id}                     → actualizar
// GET  /api/v1/rol                                 → lista roles
// GET  /api/v1/usuariorol/por-usuario/{id}         → roles del usuario
// POST /api/v1/usuariorol                          → asignar rol
// DELETE /api/v1/usuariorol/{usuarioRolId}         → quitar rol
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '');

const ACTIVO_OPTIONS = [
    { value: 'true', label: 'Activo' },
    { value: 'false', label: 'Inactivo' },
];

// ============================================================
// MODAL DETALLE
// ============================================================
const UserDetailModal = ({ usuario, rolesUsuario, onClose }) => {
    const { token } = useAuth();
    if (!usuario) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.avatar}>
                            {usuario.nombreCompleto?.[0] ?? usuario.userName?.[0]}
                        </div>
                        <div>
                            <div style={styles.modalTitle}>{usuario.nombreCompleto}</div>
                            <div style={styles.modalSub}>@{usuario.userName}</div>
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.grid2}>

                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>ID Usuario</span>
                            <span style={styles.fieldValue}>{usuario.usuarioAppId}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Estado</span>
                            <StatusBadge activo={usuario.activo ? 1 : 0} />
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Username</span>
                            <span style={{
                                ...styles.fieldValue,
                                fontFamily: 'var(--admin-font-mono)',
                                color: 'var(--admin-blue-action)',
                            }}>
                                @{usuario.userName}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Nombre Completo</span>
                            <span style={styles.fieldValue}>{usuario.nombreCompleto}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Correo</span>
                            <span style={{ ...styles.fieldValue, color: 'var(--admin-blue-action)' }}>
                                {usuario.correoElectronico}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Teléfono</span>
                            <span style={styles.fieldValue}>{usuario.telefono ?? '—'}</span>
                        </div>

                    </div>

                    {/* Roles asignados */}
                    <div style={{ marginTop: '20px' }}>
                        <span style={styles.fieldLabel}>Roles Asignados</span>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                            {rolesUsuario.length === 0 ? (
                                <span style={{ fontSize: '13px', color: 'var(--admin-text-muted)' }}>
                                    Sin roles asignados
                                </span>
                            ) : rolesUsuario.map(r => (
                                <StatusBadge key={r.rolId ?? r.usuarioRolId} role={r.nombre ?? r.rolNombre} />
                            ))}
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
const ROLES_PERMITIDOS = ['ADMIN', 'ADMINISTRADOR', 'OPERADOR', 'AGENTE_VENTAS', 'SUPERVISOR'];

const UserFormModal = ({ usuario, roles, onClose, onSaved }) => {
    const { token } = useAuth();
    const isEdit = !!usuario;

    const rolesFiltrados = roles.filter(r =>
        r.activo &&
        r.nombre &&
        r.nombre.trim() !== '' &&
        !r.nombre.startsWith('Nombre') &&
        ROLES_PERMITIDOS.includes(r.nombre.toUpperCase())
    );

    const [form, setForm] = useState({
        userName: usuario?.userName ?? '',
        nombreCompleto: usuario?.nombreCompleto ?? '',
        correoElectronico: usuario?.correoElectronico ?? '',
        telefono: usuario?.telefono ?? '',
        activo: usuario?.activo ?? true,
        passwordHash: '',
    });

    const [selectedRolId, setSelectedRolId] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async () => {
        const errs = {};

        if (!isEdit) {
            if (!form.userName) errs.userName = 'Obligatorio.';
            else if (!/^[a-z0-9_]{3,20}$/.test(form.userName))
                errs.userName = 'Solo letras minúsculas, números y guión bajo (3-20).';
        }

        const nombre = form.nombreCompleto.trim();
        if (!nombre) errs.nombreCompleto = 'Obligatorio.';
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,80}$/.test(nombre))
            errs.nombreCompleto = 'Solo letras y espacios (3-80).';

        if (!form.correoElectronico) errs.correoElectronico = 'Obligatorio.';
        else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.correoElectronico))
            errs.correoElectronico = 'Ingresa un email válido. Ej: nombre@dominio.com';

        if (form.telefono && !/^(?:\+593\d{9}|0\d{9})$/.test(form.telefono))
            errs.telefono = 'Formato +593XXXXXXXXX o 0XXXXXXXXX.';

        if (!isEdit && !selectedRolId) errs.rolId = 'Selecciona un rol.';

        if (!isEdit) {
            if (!form.passwordHash) errs.passwordHash = 'Obligatorio.';
            else if (
                form.passwordHash.length < 8 ||
                !/[A-Z]/.test(form.passwordHash) ||
                !/[a-z]/.test(form.passwordHash) ||
                !/[0-9]/.test(form.passwordHash) ||
                !/[!@#$%^&*]/.test(form.passwordHash)
            ) errs.passwordHash = 'Mín 8 chars, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo (!@#$%^&*).';
        }

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const nombreCapitalizado = nombre.charAt(0).toUpperCase() + nombre.slice(1);

            const url = isEdit
                ? `${API_BASE}/api/v1/usuarioapp/${usuario.usuarioAppId}`
                : `${API_BASE}/api/v1/usuarioapp`;
            const method = isEdit ? 'PUT' : 'POST';

            const body = {
                userName: form.userName,
                nombreCompleto: nombreCapitalizado,
                correoElectronico: form.correoElectronico,
                telefono: form.telefono || null,
                activo: form.activo === true || form.activo === 'true',
            };

            if (isEdit) {
                body.usuarioAppId = usuario.usuarioAppId;
                body.passwordHash = usuario.passwordHash || 'DUMMY_HASH_VAL_123';
            } else {
                body.passwordHash = form.passwordHash;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                let msg = errData?.message || `Error HTTP: ${res.status}`;
                if (res.status === 401 || res.status === 403) msg = 'No tienes permisos para realizar esta acción.';
                throw new Error(msg);
            }

            const data = await res.json();

            if (selectedRolId) {
                const uid = isEdit ? usuario.usuarioAppId : (data?.data?.usuarioAppId ?? data?.usuarioAppId);
                await fetch(`${API_BASE}/api/v1/usuariorol`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ usuarioAppId: uid, rolId: Number(selectedRolId) }),
                });
            }

            onSaved();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };


    const passStrength = (() => {
        let s = 0;
        const p = form.passwordHash;
        if (/[A-Z]/.test(p)) s++;
        if (/[a-z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[!@#$%^&*]/.test(p)) s++;
        if (p.length >= 8) s++;
        if (s >= 5) return { label: 'Fuerte', color: 'var(--admin-success)' };
        if (s >= 3) return { label: 'Media', color: 'orange' };
        return { label: 'Débil', color: 'var(--admin-error)' };
    })();

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div>
                        <div style={styles.modalTitle}>
                            {isEdit ? `Editar Usuario — ${usuario.userName}` : 'Nuevo Usuario'}
                        </div>
                        <div style={styles.modalSub}>
                            {isEdit ? 'Modifica los datos del usuario' : 'Completa los datos para crear un usuario admin'}
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.grid2}>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Username *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.userName ? 'var(--admin-error)' : undefined, opacity: isEdit ? 0.6 : 1 }}
                                type="text"
                                name="userName"
                                value={form.userName}
                                onChange={handleChange}
                                placeholder="Ej: jperez"
                                disabled={isEdit}
                            />
                            {fieldErrors.userName && <span style={styles.errorText}>{fieldErrors.userName}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Nombre Completo *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.nombreCompleto ? 'var(--admin-error)' : undefined }}
                                type="text"
                                name="nombreCompleto"
                                value={form.nombreCompleto}
                                onChange={handleChange}
                                placeholder="Ej: Juan Pérez"
                            />
                            {fieldErrors.nombreCompleto && <span style={styles.errorText}>{fieldErrors.nombreCompleto}</span>}
                        </div>

                        <div style={{ ...styles.formField, gridColumn: '1 / -1' }}>
                            <label style={styles.fieldLabel}>Correo Electrónico *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.correoElectronico ? 'var(--admin-error)' : undefined }}
                                type="email"
                                name="correoElectronico"
                                value={form.correoElectronico}
                                onChange={handleChange}
                                placeholder="Ej: jperez@system.com"
                            />
                            {fieldErrors.correoElectronico && <span style={styles.errorText}>{fieldErrors.correoElectronico}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Teléfono</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.telefono ? 'var(--admin-error)' : undefined }}
                                type="text"
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                placeholder="Ej: +593999999999"
                            />
                            {fieldErrors.telefono && <span style={styles.errorText}>{fieldErrors.telefono}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Estado</label>
                            <select className="admin-input" name="activo" value={form.activo} onChange={handleChange}>
                                <option value={true}>Activo</option>
                                <option value={false}>Inactivo</option>
                            </select>
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>{isEdit ? 'Agregar Rol' : 'Rol *'}</label>
                            <select
                                className="admin-input"
                                style={{ borderColor: fieldErrors.rolId ? 'var(--admin-error)' : undefined }}
                                value={selectedRolId}
                                onChange={e => { setSelectedRolId(e.target.value); if (fieldErrors.rolId) setFieldErrors(p => ({ ...p, rolId: null })); }}
                            >
                                <option value="">— Seleccionar rol —</option>
                                {rolesFiltrados.map(r => (
                                    <option key={r.rolId} value={r.rolId}>{r.nombre}</option>
                                ))}
                            </select>
                            {fieldErrors.rolId && <span style={styles.errorText}>{fieldErrors.rolId}</span>}
                        </div>

                        {!isEdit && (
                            <div style={{ ...styles.formField, gridColumn: '1 / -1' }}>
                                <label style={styles.fieldLabel}>Contraseña *</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        className="admin-input"
                                        style={{ borderColor: fieldErrors.passwordHash ? 'var(--admin-error)' : undefined, width: '100%', paddingRight: '40px' }}
                                        type={showPassword ? 'text' : 'password'}
                                        name="passwordHash"
                                        value={form.passwordHash}
                                        onChange={handleChange}
                                        placeholder="Contraseña del usuario"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {form.passwordHash && (
                                    <div style={{ fontSize: '11px', marginTop: '4px', color: passStrength.color, fontWeight: 600 }}>
                                        Fortaleza: {passStrength.label}
                                    </div>
                                )}
                                {fieldErrors.passwordHash && <span style={styles.errorText}>{fieldErrors.passwordHash}</span>}
                            </div>
                        )}

                    </div>

                    {error && (
                        <div style={{ marginTop: '16px', background: 'var(--admin-error-bg)', color: 'var(--admin-error)', border: '1px solid var(--admin-error)', borderRadius: 'var(--admin-radius)', padding: '10px 14px', fontSize: '13px' }}>
                            ⚠ {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancelar</button>
                        <button className="admin-btn admin-btn-primary" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
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
const UsersPage = () => {
    const { token } = useAuth();

    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [rolesUsuario, setRolesUsuario] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // ── Fetch: GET /api/v1/usuarioapp ───────────────────────
    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/usuarioapp`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            setUsuarios(json.data ?? json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch: GET /api/v1/rol ──────────────────────────────
    const fetchRoles = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/rol`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) return;
            const json = await res.json();
            setRoles(json.data ?? json);
        } catch {
            // silencioso, los roles son secundarios
        }
    };

    // ── Fetch roles de un usuario específico ───────────────
    // GET /api/v1/usuariorol/por-usuario/{usuarioAppId}
    const fetchRolesUsuario = async (usuarioAppId) => {
        try {
            const res = await fetch(
                `${API_BASE}/api/v1/usuariorol/por-usuario/${usuarioAppId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                }
            );
            if (!res.ok) return [];
            const json = await res.json();
            return json.data ?? json;
        } catch {
            return [];
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsuarios();
            fetchRoles();
        }
    }, [token]);

    // ── Al seleccionar usuario para ver detalle ─────────────
    const handleView = async (usuario) => {
        const rolesData = await fetchRolesUsuario(usuario.usuarioAppId);
        setRolesUsuario(rolesData);
        setSelected(usuario);
    };

    // ── Columnas ────────────────────────────────────────────
    const columns = [
        {
            key: 'userName',
            label: 'Usuario',
            render: (val, row) => (
                <div className="admin-table__cell-user">
                    <div className="admin-table__cell-avatar">
                        {row.nombreCompleto?.[0] ?? val?.[0]}
                    </div>
                    <div>
                        <div className="admin-table__cell-name">{row.nombreCompleto}</div>
                        <div className="admin-table__cell-sub">@{val}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'correoElectronico',
            label: 'Correo',
            render: (val) => (
                <span style={{ fontSize: '12px', color: 'var(--admin-blue-action)' }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'telefono',
            label: 'Teléfono',
            render: (val) => (
                <span style={{ fontSize: '12px', fontFamily: 'var(--admin-font-mono)' }}>
                    {val ?? '—'}
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
                    <h1 className="admin-page-title">Usuarios</h1>
                    <p className="admin-page-subtitle">
                        Gestión de usuarios administrativos y sus roles
                    </p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => { setEditing(null); setShowForm(true); }}
                >
                    + Nuevo Usuario
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
                    ⚠ No se pudieron cargar los usuarios: {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={usuarios}
                loading={loading}
                filterKey="activo"
                filterOptions={ACTIVO_OPTIONS}
                searchPlaceholder="Buscar por nombre, username, correo..."
                emptyText="No hay usuarios registrados."
                actions={(row) => (
                    <ActionButtons
                        onView={() => handleView(row)}
                        onEdit={() => { setEditing(row); setShowForm(true); }}
                    />
                )}
            />

            {selected && (
                <UserDetailModal
                    usuario={selected}
                    rolesUsuario={rolesUsuario}
                    onClose={() => { setSelected(null); setRolesUsuario([]); }}
                />
            )}

            {showForm && (
                <UserFormModal
                    usuario={editing}
                    roles={roles}
                    onClose={() => setShowForm(false)}
                    onSaved={fetchUsuarios}
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
        width: '100%', maxWidth: '620px',
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
        fontWeight: 500,
    },
    avatar: {
        width: '40px', height: '40px',
        borderRadius: '50%',
        background: 'var(--admin-blue-dark)',
        color: '#fff', fontSize: '16px', fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
};

export default UsersPage;