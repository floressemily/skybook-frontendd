// src/components/common/Loader.jsx
import React from 'react';

const Loader = ({ message = 'Cargando...', fullPage = false }) => {
  const containerStyle = fullPage
    ? {
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
        zIndex: 9999,
      }
    : {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px',
        gap: '12px',
      };

  return (
    <div style={containerStyle}>
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #E7E7E7',
          borderTop: '4px solid #006CE4',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {message && (
        <p style={{ color: '#4C4C4C', fontSize: '14px' }}>{message}</p>
      )}
    </div>
  );
};

export default Loader;