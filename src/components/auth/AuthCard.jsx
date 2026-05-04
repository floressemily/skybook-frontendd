// src/components/auth/AuthCard.jsx

const LogoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
);

const AuthCard = ({ children }) => (
    <div className="auth-page">
        <div className="auth-card">
            <div className="auth-logo">
                <div className="auth-logo__icon">
                    <LogoIcon />
                </div>
                <span className="auth-logo__text">SkyBook</span>
            </div>
            {children}
        </div>
    </div>
);

export default AuthCard;