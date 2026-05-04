// src/components/common/Input.jsx
import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  disabled = false,
  required = false,
  style = {},
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...style }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#4C4C4C',
          }}
        >
          {label}
          {required && <span style={{ color: '#D32F2F', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          padding: '10px 14px',
          borderRadius: '8px',
          border: `1.5px solid ${error ? '#D32F2F' : '#E7E7E7'}`,
          fontSize: '15px',
          color: '#1A1A1A',
          backgroundColor: disabled ? '#F5F5F5' : '#fff',
          outline: 'none',
          transition: 'border-color 0.2s',
          width: '100%',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#006CE4'; }}
        onBlur={(e) => { e.target.style.borderColor = error ? '#D32F2F' : '#E7E7E7'; }}
      />
      {error && (
        <span style={{ fontSize: '12px', color: '#D32F2F' }}>{error}</span>
      )}
    </div>
  );
};

export default Input;