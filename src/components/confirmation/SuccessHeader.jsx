// src/components/confirmation/SuccessHeader.jsx
import React from 'react';

const SuccessHeader = ({ email }) => {
  return (
    <div className="success-header">
      <div className="success-header__icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h1 className="success-header__title">¡Tu viaje está confirmado!</h1>
      <div style={{ 
        display: 'inline-block', 
        backgroundColor: '#E8F5E9', 
        color: '#2E7D32', 
        padding: '4px 12px', 
        borderRadius: '20px', 
        fontSize: '14px', 
        fontWeight: '700',
        marginBottom: '16px'
      }}>
        Estado: Confirmada
      </div>
      <p className="success-header__subtitle">
        Hemos enviado los boletos electrónicos a tu correo: {email || 'correo registrado'}.
      </p>
    </div>
  );
};

export default SuccessHeader;
