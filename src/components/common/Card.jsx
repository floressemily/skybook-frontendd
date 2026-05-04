// src/components/common/Card.jsx
import React from 'react';

const Card = ({ children, style = {}, className = '' }) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #E7E7E7',
        padding: '24px',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Card;