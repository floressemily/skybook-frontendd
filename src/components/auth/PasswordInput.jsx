// src/components/auth/PasswordInput.jsx
import { useState } from 'react';

const calcStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-4
};

const STRENGTH_LABELS = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const STRENGTH_CLASS = ['', 'weak', 'fair', 'good', 'strong'];

const EyeIcon = ({ visible }) => visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const PasswordInput = ({
    name,
    value,
    onChange,
    placeholder = 'Contraseña',
    error,
    showStrength = false,
    disabled = false,
}) => {
    const [visible, setVisible] = useState(false);
    const strength = showStrength ? calcStrength(value) : 0;

    return (
        <div>
            <div className="auth-pw-wrap">
                <input
                    id={name}
                    name={name}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`auth-input${error ? ' error' : ''}`}
                    autoComplete={name === 'password' ? 'current-password' : 'new-password'}
                />
                <button
                    type="button"
                    className="auth-pw-eye"
                    onClick={() => setVisible(v => !v)}
                    tabIndex={-1}
                    aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                    <EyeIcon visible={visible} />
                </button>
            </div>

            {showStrength && value && (
                <div className="pw-strength">
                    <div className="pw-strength__bars">
                        {[1, 2, 3, 4].map(level => (
                            <div
                                key={level}
                                className={`pw-strength__bar ${strength >= level ? STRENGTH_CLASS[strength] : ''}`}
                            />
                        ))}
                    </div>
                    <span className="pw-strength__label">
                        {STRENGTH_LABELS[strength]}
                    </span>
                </div>
            )}

            {error && <span className="auth-error">{error}</span>}
        </div>
    );
};

export default PasswordInput;