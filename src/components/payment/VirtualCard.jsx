// src/components/payment/VirtualCard.jsx
import React from 'react';

const VirtualCard = ({ formData }) => {
  const formatCardNumber = (number) => {
    if (!number) return '•••• •••• •••• ••••';
    // Remove non-digits and pad with asterisks if needed to 16
    const cleanNumber = number.replace(/\D/g, '');
    const padded = cleanNumber.padEnd(16, '•');
    return `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)} ${padded.slice(12, 16)}`;
  };

  return (
    <div className="virtual-card">
      <div className="virtual-card__chip"></div>
      <div className="virtual-card__number">
        {formatCardNumber(formData.cardNumber)}
      </div>
      <div className="virtual-card__footer">
        <div className="virtual-card__name">
          {formData.cardholderName ? formData.cardholderName.toUpperCase() : 'NOMBRE DEL TITULAR'}
        </div>
        <div className="virtual-card__expiry">
          {formData.expiryDate || 'MM/AA'}
        </div>
      </div>
    </div>
  );
};

export default VirtualCard;
