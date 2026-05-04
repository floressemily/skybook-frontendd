// src/components/auth/RegisterForm.jsx
// Endpoint real: POST /api/v1/clientes
// Tabla: ventas.Cliente
// Campos enviados: Nombre, Apellido, Email, PasswordHash, Telefono,
//                  FechaNacimiento, Nacionalidad, TipoDocumento, NumeroDocumento, Activo
// NO se crea Pasajero aquí — eso ocurre en Payment.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import { crearCliente } from '../../services/cliente.service';
import { login as loginService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

// ── Regex de validación ───────────────────────────────────────────────────────
const NOMBRE_RE   = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
const EMAIL_RE    = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const TELEFONO_RE = /^(\+593\d{9}|0\d{9})$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const TIPOS_DOCUMENTO = ['CEDULA', 'PASAPORTE', 'RUC'];

const initialState = {
    nombre:          '',
    apellido:        '',
    email:           '',
    password:        '',
    telefono:        '',
    fechaNacimiento: '',
    nacionalidad:    '',
    tipoDocumento:   '',
    numeroDocumento: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const calcEdad = (fechaStr) => {
    if (!fechaStr) return 0;
    const hoy    = new Date();
    const nacido = new Date(fechaStr);
    let edad = hoy.getFullYear() - nacido.getFullYear();
    const m  = hoy.getMonth() - nacido.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacido.getDate())) edad--;
    return edad;
};

const RegisterForm = () => {
    const navigate = useNavigate();
    const { registerCliente, login } = useAuth();

    const [form, setForm]             = useState(initialState);
    const [errors, setErrors]         = useState({});
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [loading, setLoading]       = useState(false);
    const [apiError, setApiError]     = useState('');
    const [apiInfo, setApiInfo]       = useState('');

    // Actualizar campo y limpiar error de ese campo
    const set = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // ── Validación completa ───────────────────────────────────────────────────
    const validate = () => {
        const err = {};

        // Nombre — solo letras y espacios
        if (!form.nombre.trim()) {
            err.nombre = 'El nombre es requerido.';
        } else if (!NOMBRE_RE.test(form.nombre.trim())) {
            err.nombre = 'Solo se permiten letras y espacios.';
        }

        // Apellido — solo letras y espacios
        if (!form.apellido.trim()) {
            err.apellido = 'El apellido es requerido.';
        } else if (!NOMBRE_RE.test(form.apellido.trim())) {
            err.apellido = 'Solo se permiten letras y espacios.';
        }

        // Email — formato estricto
        if (!form.email.trim()) {
            err.email = 'El correo electrónico es requerido.';
        } else if (!EMAIL_RE.test(form.email.trim())) {
            err.email = 'Formato inválido. Ej: usuario@dominio.com';
        }

        // Contraseña — min 8, mayúscula, minúscula, número, especial
        if (!form.password) {
            err.password = 'La contraseña es requerida.';
        } else if (!PASSWORD_RE.test(form.password)) {
            err.password =
                'Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
        }

        // Teléfono — formato ecuatoriano (+593XXXXXXXXX o 0XXXXXXXXX)
        if (!form.telefono.trim()) {
            err.telefono = 'El teléfono es requerido.';
        } else if (!TELEFONO_RE.test(form.telefono.trim())) {
            err.telefono = 'Formato inválido. Usa +593XXXXXXXXX o 0XXXXXXXXX.';
        }

        // Fecha de nacimiento — requerida y mayor de 18 años
        if (!form.fechaNacimiento) {
            err.fechaNacimiento = 'La fecha de nacimiento es requerida.';
        } else if (calcEdad(form.fechaNacimiento) < 18) {
            err.fechaNacimiento = 'Debes ser mayor de 18 años para registrarte.';
        }

        // N° documento — requerido si hay tipo
        if (form.tipoDocumento && !form.numeroDocumento.trim()) {
            err.numeroDocumento = 'Ingresa el número de documento.';
        }

        // Términos
        if (!aceptaTerminos) {
            err.terminos = 'Debes aceptar los términos para continuar.';
        }

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setApiInfo('');
        if (!validate()) return;

        setLoading(true);
        try {
            const responseData = await crearCliente(form);

            if (responseData?.success) {
                const clienteCreado = responseData.data;

                if (clienteCreado) registerCliente(clienteCreado);

                setApiInfo('¡Cuenta creada con éxito! Iniciando sesión automáticamente...');

                // Auto-login con las mismas credenciales
                try {
                    const loginResponse = await loginService(form.email, form.password);
                    if (loginResponse?.success) login(loginResponse);
                } catch {
                    // Si el auto-login falla, redirigir a /login como fallback
                }

                setTimeout(() => navigate('/'), 1500);
            } else {
                setApiError(responseData?.message || 'No se pudo crear la cuenta.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || '';
            if (err.response?.status === 409 || msg.toLowerCase().includes('email')) {
                setApiError('Ya existe una cuenta con ese correo electrónico.');
            } else if (err.response?.status === 400) {
                setApiError(err.response?.data?.message || 'Datos inválidos. Revisa el formulario.');
            } else {
                setApiError('No se pudo conectar con el servidor. Intenta más tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h1 className="auth-title">Crea tu cuenta</h1>
            <p className="auth-subtitle">
                Ahorra tiempo en tus reservas y recibe ofertas exclusivas
            </p>

            {/* Alertas globales */}
            {apiError && <div className="auth-alert auth-alert--error">{apiError}</div>}
            {apiInfo  && <div className="auth-alert auth-alert--success">{apiInfo}</div>}

            {/* Nombre + Apellido */}
            <div className="auth-row-2">
                <div className="auth-field">
                    <label className="auth-label" htmlFor="nombre">
                        Nombre <span>*</span>
                    </label>
                    <input
                        id="nombre" name="nombre" type="text"
                        value={form.nombre} onChange={set('nombre')}
                        placeholder="Juan"
                        className={`auth-input${errors.nombre ? ' error' : ''}`}
                        disabled={loading}
                        autoFocus
                    />
                    {errors.nombre && <span className="auth-error">{errors.nombre}</span>}
                </div>

                <div className="auth-field">
                    <label className="auth-label" htmlFor="apellido">
                        Apellido <span>*</span>
                    </label>
                    <input
                        id="apellido" name="apellido" type="text"
                        value={form.apellido} onChange={set('apellido')}
                        placeholder="Pérez"
                        className={`auth-input${errors.apellido ? ' error' : ''}`}
                        disabled={loading}
                    />
                    {errors.apellido && <span className="auth-error">{errors.apellido}</span>}
                </div>
            </div>

            {/* Email */}
            <div className="auth-field">
                <label className="auth-label" htmlFor="email">
                    Correo electrónico <span>*</span>
                </label>
                <input
                    id="email" name="email" type="email"
                    value={form.email} onChange={set('email')}
                    placeholder="juan@ejemplo.com"
                    className={`auth-input${errors.email ? ' error' : ''}`}
                    disabled={loading}
                    autoComplete="email"
                />
                {errors.email && <span className="auth-error">{errors.email}</span>}
            </div>

            {/* Contraseña con fortaleza y ojo */}
            <div className="auth-field">
                <label className="auth-label" htmlFor="password">
                    Contraseña <span>*</span>
                </label>
                <PasswordInput
                    name="password"
                    value={form.password}
                    onChange={e => {
                        setForm(p => ({ ...p, password: e.target.value }));
                        setErrors(p => ({ ...p, password: '' }));
                    }}
                    placeholder="Mínimo 8 caracteres"
                    error={errors.password}
                    showStrength={true}
                    disabled={loading}
                />
            </div>

            {/* Teléfono */}
            <div className="auth-field">
                <label className="auth-label" htmlFor="telefono">
                    Teléfono <span>*</span>
                </label>
                <input
                    id="telefono" name="telefono" type="tel"
                    value={form.telefono} onChange={set('telefono')}
                    placeholder="+593 99 999 9999 o 0991234567"
                    className={`auth-input${errors.telefono ? ' error' : ''}`}
                    disabled={loading}
                />
                {errors.telefono && <span className="auth-error">{errors.telefono}</span>}
            </div>

            {/* Fecha de nacimiento + Nacionalidad */}
            <div className="auth-row-2">
                <div className="auth-field">
                    <label className="auth-label" htmlFor="fechaNacimiento">
                        Fecha de nacimiento <span>*</span>
                    </label>
                    <input
                        id="fechaNacimiento" name="fechaNacimiento" type="date"
                        value={form.fechaNacimiento} onChange={set('fechaNacimiento')}
                        className={`auth-input${errors.fechaNacimiento ? ' error' : ''}`}
                        disabled={loading}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                            .toISOString().split('T')[0]}
                    />
                    {errors.fechaNacimiento && (
                        <span className="auth-error">{errors.fechaNacimiento}</span>
                    )}
                </div>

                <div className="auth-field">
                    <label className="auth-label" htmlFor="nacionalidad">Nacionalidad</label>
                    <input
                        id="nacionalidad" name="nacionalidad" type="text"
                        value={form.nacionalidad} onChange={set('nacionalidad')}
                        placeholder="Ecuatoriana"
                        className="auth-input"
                        disabled={loading}
                    />
                </div>
            </div>

            {/* Tipo de documento + Número */}
            <div className="auth-row-2">
                <div className="auth-field">
                    <label className="auth-label" htmlFor="tipoDocumento">Tipo documento</label>
                    <select
                        id="tipoDocumento" name="tipoDocumento"
                        value={form.tipoDocumento} onChange={set('tipoDocumento')}
                        className="auth-input"
                        disabled={loading}
                    >
                        <option value="">Seleccionar</option>
                        {TIPOS_DOCUMENTO.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div className="auth-field">
                    <label className="auth-label" htmlFor="numeroDocumento">
                        N° documento{form.tipoDocumento && <span> *</span>}
                    </label>
                    <input
                        id="numeroDocumento" name="numeroDocumento" type="text"
                        value={form.numeroDocumento} onChange={set('numeroDocumento')}
                        placeholder="0912345678"
                        className={`auth-input${errors.numeroDocumento ? ' error' : ''}`}
                        disabled={loading || !form.tipoDocumento}
                    />
                    {errors.numeroDocumento && (
                        <span className="auth-error">{errors.numeroDocumento}</span>
                    )}
                </div>
            </div>

            {/* Términos */}
            <div className="auth-check-row">
                <input
                    type="checkbox"
                    id="terminos"
                    checked={aceptaTerminos}
                    onChange={e => {
                        setAceptaTerminos(e.target.checked);
                        setErrors(p => ({ ...p, terminos: '' }));
                    }}
                    disabled={loading}
                />
                <label htmlFor="terminos">
                    Acepto los{' '}
                    <a href="#" onClick={e => e.preventDefault()}>Términos de Uso</a>{' '}
                    y la{' '}
                    <a href="#" onClick={e => e.preventDefault()}>Política de Privacidad</a>
                </label>
            </div>
            {errors.terminos && (
                <span className="auth-error" style={{ display: 'block', marginTop: -10, marginBottom: 10 }}>
                    {errors.terminos}
                </span>
            )}

            {/* Botón crear cuenta */}
            <button
                type="submit"
                id="btn-register"
                className="auth-btn"
                disabled={loading}
            >
                {loading && <span className="auth-spinner" />}
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            {/* Link a login */}
            <div className="auth-footer">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login">Inicia sesión</Link>
            </div>
        </form>
    );
};

export default RegisterForm;