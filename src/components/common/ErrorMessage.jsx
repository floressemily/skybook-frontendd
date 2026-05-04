// src/components/common/ErrorMessage.jsx
import React from 'react';

const ErrorMessage = ({ message, onRetry = null }) => {
  if (!message) return null;

  return (
    <div
      style={{
        backgroundColor: '#FDECEA',
        border: '1px solid #D32F2F',
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <div style={{ flex: 1 }}>
        <p style={{ color: '#D32F2F', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
          Error
        </p>
        <p style={{ color: '#B71C1C', fontSize: '14px' }}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginTop: '10px',
              padding: '6px 16px',
              backgroundColor: '#D32F2F',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;