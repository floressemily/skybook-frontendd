// src/components/auth/LoginForm.jsx
// Endpoint real: POST /api/v1/auth/login
// Valida UsuarioApp (seg.UsuarioApp).
// Sin OAuth / Google — autenticación propia únicamente.

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import { login as loginService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

// ── Regex ────────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors]     = useState({});
    const [loading, setLoading]   = useState(false);
    const [apiError, setApiError] = useState('');
    const [apiInfo, setApiInfo]   = useState('');

    const inputRef = useRef(null);

    // Autofocus en el campo de usuario/email
    useEffect(() => { inputRef.current?.focus(); }, []);

    // Destino al que redirigir después del login
    const from = location.state?.from || '/';

    // Si ya está autenticado, redirigir automáticamente
    useEffect(() => {
        if (isAuthenticated) navigate(from, { replace: true });
    }, [isAuthenticated, navigate, from]);

    // ── Validación ────────────────────────────────────────────────────────────
    const validate = () => {
        const err = {};
        const val = userName.trim();

        if (!val) {
            err.userName = 'El usuario o correo es requerido.';
        } else if (val.includes('@') && !EMAIL_RE.test(val)) {
            // Si parece un email, validar formato estricto
            err.userName = 'Formato de correo inválido (ej: usuario@dominio.com).';
        }

        if (!password) {
            err.password = 'La contraseña es requerida.';
        } else if (password.length < 8) {
            err.password = 'La contraseña debe tener al menos 8 caracteres.';
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
            const responseData = await loginService(userName.trim(), password);

            if (responseData?.success) {
                login(responseData);
                const payload   = responseData?.data ?? responseData;
                const userRoles = Array.isArray(payload?.roles) ? payload.roles : [];
                const isAdmin   = userRoles.some(r =>
                    ['admin', 'administrador'].includes(String(r).toLowerCase())
                );
                navigate(isAdmin ? '/admin' : from, { replace: true });
            } else {
                setApiError(responseData?.message || 'Credenciales incorrectas. Verifica tu usuario y contraseña.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || '';

            if (err.response?.status === 401) {
                setApiError('Usuario o contraseña incorrectos. Intenta de nuevo.');
            } else if (err.response?.status === 404 || msg.toLowerCase().includes('cliente')) {
                setApiInfo(
                    'El acceso de clientes estará disponible próximamente. ' +
                    'Si eres administrador, ingresa con tus credenciales de usuario.'
                );
            } else {
                setApiError('No se pudo conectar con el servidor. Intenta más tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h1 className="auth-title">Inicia sesión</h1>

            {/* Alertas globales */}
            {apiError && <div className="auth-alert auth-alert--error">{apiError}</div>}
            {apiInfo  && <div className="auth-alert auth-alert--info">{apiInfo}</div>}

            {/* Usuario o email */}
            <div className="auth-field">
                <label className="auth-label" htmlFor="userName">
                    Usuario o correo <span>*</span>
                </label>
                <input
                    ref={inputRef}
                    id="userName"
                    name="userName"
                    type="text"
                    value={userName}
                    onChange={e => { setUserName(e.target.value); setErrors(p => ({ ...p, userName: '' })); }}
                    placeholder="usuario@ejemplo.com"
                    className={`auth-input${errors.userName ? ' error' : ''}`}
                    disabled={loading}
                    autoComplete="username"
                />
                {errors.userName && <span className="auth-error">{errors.userName}</span>}
            </div>

            {/* Contraseña */}
            <div className="auth-field">
                <label className="auth-label" htmlFor="password">
                    Contraseña <span>*</span>
                </label>
                <PasswordInput
                    name="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                    placeholder="Mínimo 8 caracteres"
                    error={errors.password}
                    disabled={loading}
                />
            </div>

            {/* Olvidé contraseña */}
            <div className="auth-forgot">
                <a href="#" onClick={e => e.preventDefault()}>
                    ¿Olvidaste tu contraseña?
                </a>
            </div>

            {/* Botón login */}
            <button
                type="submit"
                id="btn-login"
                className="auth-btn"
                disabled={loading}
            >
                {loading && <span className="auth-spinner" />}
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            {/* Link a registro */}
            <div className="auth-footer">
                ¿No tienes cuenta?{' '}
                <Link to="/register">Crear cuenta</Link>
            </div>
        </form>
    );
};

export default LoginForm;