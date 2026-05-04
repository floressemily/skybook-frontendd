// src/components/confirmation/BookingReference.jsx
import React from 'react';

const BookingReference = ({ code }) => {
  return (
    <div className="booking-reference">
      <div className="booking-reference__label">Código de reserva</div>
      <div className="booking-reference__code">{code || 'XXXXX'}</div>
    </div>
  );
};

export default BookingReference;
