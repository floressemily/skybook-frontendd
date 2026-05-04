// src/components/confirmation/PostPurchaseActions.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PostPurchaseActions = () => {
  const handleCalendar = () => {
    alert('Función "Añadir al calendario" no disponible en esta demo.'); // TODO: Implementar
  };

  const handleDownload = () => {
    alert('Función "Descargar PDF" no disponible en esta demo.'); // TODO: Implementar
  };

  return (
    <div className="post-purchase-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <Link to="/" className="btn btn-primary" style={{ textAlign: 'center' }}>
        Volver al inicio
      </Link>
    </div>
  );
};

export default PostPurchaseActions;
