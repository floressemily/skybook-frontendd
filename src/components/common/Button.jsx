// src/components/common/Button.jsx
import React from 'react';

const styles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 24px',
    borderRadius: 'var(--radius, 8px)',
    fontWeight: 600,
    fontSize: '15px',
    border: '2px solid transparent',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  primary: {
    backgroundColor: '#006CE4',
    color: '#fff',
    borderColor: '#006CE4',
  },
  secondary: {
    backgroundColor: '#003580',
    color: '#fff',
    borderColor: '#003580',
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#006CE4',
    borderColor: '#006CE4',
  },
  disabled: {
    opacity: 0.55,
    cursor: 'not-allowed',
  },
  fullWidth: {
    width: '100%',
  },
};

const Button = ({
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  style = {},
}) => {
  const combinedStyle = {
    ...styles.base,
    ...styles[variant],
    ...(disabled || loading ? styles.disabled : {}),
    ...(fullWidth ? styles.fullWidth : {}),
    ...style,
  };

  return (
    <button
      type={type}
      style={combinedStyle}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? 'Cargando...' : children}
    </button>
  );
};

export default Button;