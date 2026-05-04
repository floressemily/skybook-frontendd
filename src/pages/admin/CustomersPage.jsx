// src/pages/admin/CustomersPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButtons from '../../components/admin/ActionButtons';

// ============================================================
// CUSTOMERSPAGE
// Gestión de clientes del panel administrativo.
//
// APIs usadas:
// GET    /api/v1/clientes                              → lista todos
// GET    /api/v1/clientes/{id}                         → detalle
// POST   /api/v1/clientes                              → crear
// PUT    /api/v1/clientes/{id}                         → actualizar
// DELETE /api/v1/clientes/{id}                         → eliminar
// GET    /api/v1/clientes/identificacion/{numeroDoc}   → buscar por documento
// GET    /api/v1/clientes/por-email                    → buscar por email
// ============================================================

const API_BASE = 'http://localhost:5100';

const ACTIVO_OPTIONS = [
    { value: 'true', label: 'Activo' },
    { value: 'false', label: 'Inactivo' },
];

const TIPO_DOCUMENTO_OPTIONS = [
    { value: 'CEDULA', label: 'Cédula' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
    { value: 'RUC', label: 'RUC' },
];

const NACIONALIDADES = [
    "Ecuatoriana", "Colombiana", "Peruana", "Venezolana", 
    "Estadounidense", "Española", "Mexicana", "Argentina", 
    "Chilena", "Brasileña"
];

// ============================================================
// MODAL DETALLE
// ============================================================
const CustomerDetailModal = ({ cliente, onClose }) => {
    const { token } = useAuth();
    if (!cliente) return null;

    const formatDate = (val) => val
        ? new Date(val).toLocaleDateString('es-EC')
        : '—';

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.avatar}>
                            {cliente.nombre?.[0]}{cliente.apellido?.[0]}
                        </div>
                        <div>
                            <div style={styles.modalTitle}>
                                {cliente.nombre} {cliente.apellido}
                            </div>
                            <div style={styles.modalSub}>{cliente.email}</div>
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <div style={styles.grid2}>

                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>ID Cliente</span>
                            <span style={styles.fieldValue}>{cliente.clienteId}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Estado</span>
                            <StatusBadge activo={cliente.activo ? 1 : 0} />
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Nombre</span>
                            <span style={styles.fieldValue}>{cliente.nombre}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Apellido</span>
                            <span style={styles.fieldValue}>{cliente.apellido}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Email</span>
                            <span style={{ ...styles.fieldValue, color: 'var(--admin-blue-action)' }}>
                                {cliente.email}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Teléfono</span>
                            <span style={styles.fieldValue}>{cliente.telefono ?? '—'}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Tipo Documento</span>
                            <span style={styles.fieldValue}>{cliente.tipoDocumento ?? '—'}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>N° Documento</span>
                            <span style={{
                                ...styles.fieldValue,
                                fontFamily: 'var(--admin-font-mono)',
                            }}>
                                {cliente.numeroDocumento ?? '—'}
                            </span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Fecha Nacimiento</span>
                            <span style={styles.fieldValue}>{formatDate(cliente.fechaNacimiento)}</span>
                        </div>
                        <div style={styles.field}>
                            <span style={styles.fieldLabel}>Nacionalidad</span>
                            <span style={styles.fieldValue}>{cliente.nacionalidad ?? '—'}</span>
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
const CustomerFormModal = ({ cliente, onClose, onSaved }) => {
    const { token, user } = useAuth();
    const isEdit = !!cliente;

    const [form, setForm] = useState({
        nombre: cliente?.nombre ?? '',
        apellido: cliente?.apellido ?? '',
        email: cliente?.email ?? '',
        telefono: cliente?.telefono ?? '',
        fechaNacimiento: cliente?.fechaNacimiento ?? '',
        nacionalidad: cliente?.nacionalidad ?? '',
        tipoDocumento: cliente?.tipoDocumento ?? 'CEDULA',
        numeroDocumento: cliente?.numeroDocumento ?? '',
        activo: cliente?.activo ?? true,
        passwordHash: '',
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            setError(null);
            setFieldErrors({});

            let newErrors = {};

            const formatName = (str) => {
                const s = str.trim();
                return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
            };

            const nombre = formatName(form.nombre);
            const apellido = formatName(form.apellido);

            if (!nombre) newErrors.nombre = "Obligatorio.";
            else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre) || nombre.length < 2 || nombre.length > 50) {
                newErrors.nombre = "Solo se permiten letras y espacios (2-50).";
            }

            if (!apellido) newErrors.apellido = "Obligatorio.";
            else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido) || apellido.length < 2 || apellido.length > 50) {
                newErrors.apellido = "Solo se permiten letras y espacios (2-50).";
            }

            if (!form.email) newErrors.email = "Obligatorio.";
            else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(form.email)) {
                newErrors.email = "Ingresa un email válido. Ej: nombre@dominio.com";
            }

            if (form.telefono && !/^(?:\+593\d{9}|0\d{9})$/.test(form.telefono)) {
                newErrors.telefono = "Formato +593XXXXXXXXX o 0XXXXXXXXX.";
            }

            if (!form.fechaNacimiento) {
                newErrors.fechaNacimiento = "Obligatorio.";
            } else {
                const fn = new Date(form.fechaNacimiento);
                const hoy = new Date();
                let edad = hoy.getFullYear() - fn.getFullYear();
                const m = hoy.getMonth() - fn.getMonth();
                if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) {
                    edad--;
                }
                if (edad < 18) newErrors.fechaNacimiento = "El cliente debe ser mayor de 18 años";
            }

            if (!form.nacionalidad) newErrors.nacionalidad = "Obligatorio.";
            else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/.test(form.nacionalidad)) {
                newErrors.nacionalidad = "Solo letras y espacios (mín 3).";
            }

            if (!form.tipoDocumento) newErrors.tipoDocumento = "Obligatorio.";
            if (form.tipoDocumento === 'CEDULA' && !/^\d{10}$/.test(form.numeroDocumento)) {
                newErrors.numeroDocumento = "La cédula debe tener exactamente 10 dígitos numéricos.";
            }
            if (form.tipoDocumento === 'PASAPORTE' && !/^[a-zA-Z0-9]{6,9}$/.test(form.numeroDocumento)) {
                newErrors.numeroDocumento = "El pasaporte debe tener entre 6 y 9 caracteres alfanuméricos.";
            }
            if (form.tipoDocumento === 'RUC' && !/^\d{13}$/.test(form.numeroDocumento)) {
                newErrors.numeroDocumento = "El RUC debe tener exactamente 13 dígitos numéricos.";
            }

            if (!isEdit) {
                if (!form.passwordHash) newErrors.passwordHash = "Obligatorio.";
                else if (form.passwordHash.length < 8 || !/[A-Z]/.test(form.passwordHash) || !/[a-z]/.test(form.passwordHash) || !/[0-9]/.test(form.passwordHash) || !/[!@#$%^&*]/.test(form.passwordHash)) {
                    newErrors.passwordHash = "Mín 8 chars, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo (!@#$%^&*).";
                }
            }

            if (Object.keys(newErrors).length > 0) {
                setFieldErrors(newErrors);
                setSaving(false);
                return;
            }

            setForm(prev => ({ ...prev, nombre, apellido }));

            const url = isEdit
                ? `${API_BASE}/api/v1/clientes/${cliente.clienteId}`
                : `${API_BASE}/api/v1/clientes`;

            const method = isEdit ? 'PUT' : 'POST';

            const body = {
                nombre,
                apellido,
                email: form.email,
                telefono: form.telefono || null,
                fechaNacimiento: form.fechaNacimiento || null,
                nacionalidad: form.nacionalidad || null,
                tipoDocumento: form.tipoDocumento || null,
                numeroDocumento: form.numeroDocumento || null,
                activo: form.activo === true || form.activo === 'true',
            };

            if (isEdit) {
                body.clienteId = cliente.clienteId;
                body.passwordHash = cliente.passwordHash || 'DUMMY_HASH_VAL_123';
            } else {
                body.passwordHash = form.passwordHash;
            }

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
                let errMsg = errData?.message || `Error ${res.status}: Fallo de validación del servidor.`;
                if (errData?.errors) {
                    errMsg += " " + JSON.stringify(errData.errors);
                }
                throw new Error(errMsg);
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Confirmar eliminación ────────────────────────────────
    const executeDelete = async () => {
        try {
            setSaving(true);
            setError(null);
            
            console.log('Token:', token);
            console.log('User:', user);
            console.log('Roles:', user?.roles);
            
            // DELETE /api/v1/clientes/{id}
            const res = await fetch(`${API_BASE}/api/v1/clientes/${cliente.clienteId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                let errMsg = errData?.message || `Error HTTP: ${res.status}`;
                if (res.status === 401 || res.status === 403) {
                    errMsg += " (Problema de permisos o token inválido. Verifica que el usuario tenga el rol 'Admin').";
                }
                throw new Error(errMsg);
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                <div style={styles.modalHeader}>
                    <div>
                        <div style={styles.modalTitle}>
                            {isEdit
                                ? `Editar Cliente — ${cliente.nombre} ${cliente.apellido}`
                                : 'Nuevo Cliente'}
                        </div>
                        <div style={styles.modalSub}>
                            {isEdit
                                ? 'Modifica los datos del cliente'
                                : 'Completa los datos para registrar un cliente'}
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.modalBody}>
                    <datalist id="nacionalidadesList">
                        {NACIONALIDADES.map(n => <option key={n} value={n} />)}
                    </datalist>

                    <div style={styles.grid2}>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Nombre *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.nombre ? 'var(--admin-error)' : undefined }}
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Emily"
                            />
                            {fieldErrors.nombre && <span style={styles.errorText}>{fieldErrors.nombre}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Apellido *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.apellido ? 'var(--admin-error)' : undefined }}
                                type="text"
                                name="apellido"
                                value={form.apellido}
                                onChange={handleChange}
                                placeholder="Ej: Flores"
                            />
                            {fieldErrors.apellido && <span style={styles.errorText}>{fieldErrors.apellido}</span>}
                        </div>

                        <div style={{ ...styles.formField, gridColumn: '1 / -1' }}>
                            <label style={styles.fieldLabel}>Email *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.email ? 'var(--admin-error)' : undefined }}
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Ej: emily@email.com"
                            />
                            {fieldErrors.email && <span style={styles.errorText}>{fieldErrors.email}</span>}
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
                            <label style={styles.fieldLabel}>Fecha Nacimiento *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.fechaNacimiento ? 'var(--admin-error)' : undefined }}
                                type="date"
                                name="fechaNacimiento"
                                value={form.fechaNacimiento}
                                onChange={handleChange}
                            />
                            {fieldErrors.fechaNacimiento && <span style={styles.errorText}>{fieldErrors.fechaNacimiento}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Nacionalidad *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.nacionalidad ? 'var(--admin-error)' : undefined }}
                                type="text"
                                name="nacionalidad"
                                list="nacionalidadesList"
                                value={form.nacionalidad}
                                onChange={handleChange}
                                placeholder="Ej: Ecuatoriana"
                            />
                            {fieldErrors.nacionalidad && <span style={styles.errorText}>{fieldErrors.nacionalidad}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Estado</label>
                            <select
                                className="admin-input"
                                style={{ borderColor: fieldErrors.activo ? 'var(--admin-error)' : undefined }}
                                name="activo"
                                value={form.activo}
                                onChange={handleChange}
                            >
                                <option value={true}>Activo</option>
                                <option value={false}>Inactivo</option>
                            </select>
                            {fieldErrors.activo && <span style={styles.errorText}>{fieldErrors.activo}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>Tipo Documento *</label>
                            <select
                                className="admin-input"
                                style={{ borderColor: fieldErrors.tipoDocumento ? 'var(--admin-error)' : undefined }}
                                name="tipoDocumento"
                                value={form.tipoDocumento}
                                onChange={handleChange}
                            >
                                {TIPO_DOCUMENTO_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {fieldErrors.tipoDocumento && <span style={styles.errorText}>{fieldErrors.tipoDocumento}</span>}
                        </div>

                        <div style={styles.formField}>
                            <label style={styles.fieldLabel}>N° Documento *</label>
                            <input
                                className="admin-input"
                                style={{ borderColor: fieldErrors.numeroDocumento ? 'var(--admin-error)' : undefined }}
                                type="text"
                                name="numeroDocumento"
                                value={form.numeroDocumento}
                                onChange={handleChange}
                                placeholder="Ej: 1723456789"
                            />
                            {fieldErrors.numeroDocumento && <span style={styles.errorText}>{fieldErrors.numeroDocumento}</span>}
                        </div>

                        {/* Password solo en creación */}
                        {!isEdit && (() => {
                            let strength = 0;
                            const pass = form.passwordHash;
                            if (/[A-Z]/.test(pass)) strength++;
                            if (/[a-z]/.test(pass)) strength++;
                            if (/[0-9]/.test(pass)) strength++;
                            if (/[!@#$%^&*]/.test(pass)) strength++;
                            if (pass.length >= 8) strength++;
                            
                            let strLabel = 'Débil';
                            let strColor = 'var(--admin-error)';
                            if (strength >= 3) { strLabel = 'Media'; strColor = 'orange'; }
                            if (strength >= 5) { strLabel = 'Fuerte'; strColor = 'var(--admin-success)'; }

                            return (
                                <div style={{ ...styles.formField, gridColumn: '1 / -1' }}>
                                    <label style={styles.fieldLabel}>
                                        Contraseña inicial * <span style={{ color: 'var(--admin-text-muted)', textTransform: 'none' }}>(El cliente podrá cambiarla después)</span>
                                    </label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            className="admin-input"
                                            style={{ borderColor: fieldErrors.passwordHash ? 'var(--admin-error)' : undefined, width: '100%', paddingRight: '40px' }}
                                            type={showPassword ? "text" : "password"}
                                            name="passwordHash"
                                            value={form.passwordHash}
                                            onChange={handleChange}
                                            placeholder="Contraseña temporal"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                                        >
                                            {showPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                    {form.passwordHash && (
                                        <div style={{ fontSize: '11px', marginTop: '4px', color: strColor, fontWeight: 600 }}>
                                            Fortaleza: {strLabel}
                                        </div>
                                    )}
                                    {fieldErrors.passwordHash && <span style={styles.errorText}>{fieldErrors.passwordHash}</span>}
                                </div>
                            );
                        })()}

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
                        justifyContent: 'space-between', marginTop: '24px',
                    }}>
                        {/* Botón eliminar solo en edición */}
                        {isEdit ? (
                            <button
                                className="admin-btn admin-btn-danger"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={saving}
                            >
                                🗑 Eliminar cliente
                            </button>
                        ) : <span />}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="admin-btn admin-btn-secondary" onClick={onClose}>
                                Cancelar
                            </button>
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={handleSubmit}
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar cliente'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Modal Confirmación de Eliminación */}
            {showDeleteConfirm && (
                <div style={{...styles.overlay, zIndex: 300}} onClick={() => setShowDeleteConfirm(false)}>
                    <div style={{...styles.modal, maxWidth: '400px', padding: '24px'}} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, color: 'var(--admin-text-primary)' }}>¿Eliminar cliente?</h3>
                        <p style={{ color: 'var(--admin-text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                            Estás a punto de eliminar a <strong>{cliente.nombre} {cliente.apellido}</strong>. Esta acción no se puede deshacer.
                        </p>
                        
                        {error && (
                            <div style={{
                                marginTop: '16px', background: 'var(--admin-error-bg)', color: 'var(--admin-error)',
                                border: '1px solid var(--admin-error)', borderRadius: 'var(--admin-radius)',
                                padding: '10px 14px', fontSize: '13px'
                            }}>
                                ⚠ No se pudo eliminar: {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button className="admin-btn admin-btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={saving}>
                                Cancelar
                            </button>
                            <button className="admin-btn admin-btn-danger" onClick={executeDelete} disabled={saving}>
                                {saving ? 'Eliminando...' : 'Confirmar eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================
const CustomersPage = () => {
    const { token } = useAuth();

    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // ── Fetch: GET /api/v1/clientes ─────────────────────────
    const fetchClientes = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/clientes`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const json = await res.json();
            setClientes(json.data ?? json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchClientes();
    }, [token]);

    // ── Columnas ────────────────────────────────────────────
    const columns = [
        {
            key: 'nombre',
            label: 'Cliente',
            render: (val, row) => (
                <div className="admin-table__cell-user">
                    <div className="admin-table__cell-avatar">
                        {row.nombre?.[0]}{row.apellido?.[0]}
                    </div>
                    <div>
                        <div className="admin-table__cell-name">
                            {row.nombre} {row.apellido}
                        </div>
                        <div className="admin-table__cell-sub">{row.email}</div>
                    </div>
                </div>
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
            key: 'tipoDocumento',
            label: 'Tipo Doc.',
            render: (val) => (
                <span style={{
                    fontSize: '11px', fontWeight: 600,
                    background: 'var(--admin-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: 'var(--admin-radius-sm)',
                    padding: '2px 8px',
                    color: 'var(--admin-text-secondary)',
                }}>
                    {val ?? '—'}
                </span>
            ),
        },
        {
            key: 'numeroDocumento',
            label: 'N° Documento',
            render: (val) => (
                <span style={{ fontFamily: 'var(--admin-font-mono)', fontSize: '12px' }}>
                    {val ?? '—'}
                </span>
            ),
        },
        {
            key: 'nacionalidad',
            label: 'Nacionalidad',
            render: (val) => (
                <span style={{ color: 'var(--admin-text-secondary)', fontSize: '12px' }}>
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
                    <h1 className="admin-page-title">Clientes</h1>
                    <p className="admin-page-subtitle">
                        Gestión de clientes registrados en el sistema
                    </p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => { setEditing(null); setShowForm(true); }}
                >
                    + Nuevo Cliente
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
                    ⚠ No se pudieron cargar los clientes: {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={clientes}
                loading={loading}
                filterKey="activo"
                filterOptions={ACTIVO_OPTIONS}
                searchPlaceholder="Buscar por nombre, email, documento..."
                emptyText="No hay clientes registrados."
                actions={(row) => (
                    <ActionButtons
                        onView={() => setSelected(row)}
                        onEdit={() => { setEditing(row); setShowForm(true); }}
                    />
                )}
            />

            {selected && (
                <CustomerDetailModal
                    cliente={selected}
                    onClose={() => setSelected(null)}
                />
            )}

            {showForm && (
                <CustomerFormModal
                    cliente={editing}
                    onClose={() => setShowForm(false)}
                    onSaved={fetchClientes}
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
        fontWeight: 500
    },
    avatar: {
        width: '40px', height: '40px',
        borderRadius: '50%',
        background: 'var(--admin-blue-dark)',
        color: '#fff', fontSize: '14px', fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
};

export default CustomersPage;