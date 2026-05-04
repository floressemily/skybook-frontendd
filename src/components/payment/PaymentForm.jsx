// src/components/payment/PaymentForm.jsx
import React, { useState, useEffect } from 'react';

const PaymentForm = ({ formData, setFormData, onSubmit, isProcessing, total }) => {
  const [errors, setErrors] = useState({});

  // Validaciones en tiempo real y formateo
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let error = '';

    if (name === 'cardholderName') {
      // Solo letras y espacios, auto-mayúsculas
      formattedValue = value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
      if (formattedValue.trim().length < 3) {
        error = 'Mínimo 3 letras';
      }
    }

    if (name === 'cardNumber') {
      // Solo números, máx 16 dígitos, formateo XXXX XXXX XXXX XXXX
      const raw = value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 16);
      formattedValue = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
      if (raw.length < 16) {
        error = 'Debe tener 16 dígitos';
      }
    }

    if (name === 'expiryDate') {
      // Formato MM/AA, auto-slash
      let raw = value.replace(/\D/g, '').slice(0, 4);
      if (raw.length >= 2) {
        const month = parseInt(raw.slice(0, 2), 10);
        if (month > 12) raw = '12' + raw.slice(2);
        if (month === 0) raw = '01' + raw.slice(2);
        formattedValue = raw.slice(0, 2) + '/' + raw.slice(2);
      } else {
        formattedValue = raw;
      }

      if (raw.length === 4) {
        const month = parseInt(raw.slice(0, 2), 10);
        const year = parseInt('20' + raw.slice(2), 10);
        const now = new Date();
        const expiry = new Date(year, month - 1);
        if (expiry < new Date(now.getFullYear(), now.getMonth())) {
          error = 'Tarjeta vencida';
        }
      } else {
        error = 'Formato MM/AA';
      }
    }

    if (name === 'cvv') {
      // Solo números, máx 3
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
      if (formattedValue.length < 3) {
        error = '3 dígitos';
      }
    }

    if (name === 'email') {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(value)) {
        error = 'Email inválido';
      }
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar todo antes de enviar
    const newErrors = {};
    if (!formData.cardholderName || formData.cardholderName.trim().length < 3) newErrors.cardholderName = 'Nombre inválido';
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) newErrors.cardNumber = '16 dígitos requeridos';
    if (!formData.expiryDate || formData.expiryDate.length !== 5) newErrors.expiryDate = 'Fecha inválida';
    if (!formData.cvv || formData.cvv.length !== 3) newErrors.cvv = '3 dígitos requeridos';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = 'Email inválido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(e);
  };

  const errorStyle = { color: '#dc3545', fontSize: '11px', marginTop: '4px', fontWeight: '600' };

  return (
    <form className="payment-form" onSubmit={handleSubmit} noValidate>
      <div className="payment-form__group payment-form__group--full">
        <label className="payment-form__label" htmlFor="cardholderName">Nombre del titular</label>
        <input
          type="text"
          id="cardholderName"
          name="cardholderName"
          className="payment-form__input"
          placeholder="EJ. JUAN PÉREZ"
          value={formData.cardholderName}
          onChange={handleChange}
          autoComplete="cc-name"
        />
        {errors.cardholderName && <div style={errorStyle}>{errors.cardholderName}</div>}
      </div>

      <div className="payment-form__group payment-form__group--full">
        <label className="payment-form__label" htmlFor="cardNumber">Número de tarjeta</label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          className="payment-form__input"
          placeholder="0000 0000 0000 0000"
          value={formData.cardNumber}
          onChange={handleChange}
          maxLength="19"
          autoComplete="cc-number"
        />
        {errors.cardNumber && <div style={errorStyle}>{errors.cardNumber}</div>}
      </div>

      <div className="payment-form__group">
        <label className="payment-form__label" htmlFor="expiryDate">Fecha vencimiento</label>
        <input
          type="text"
          id="expiryDate"
          name="expiryDate"
          className="payment-form__input"
          placeholder="MM/AA"
          value={formData.expiryDate}
          onChange={handleChange}
          maxLength="5"
          autoComplete="cc-exp"
        />
        {errors.expiryDate && <div style={errorStyle}>{errors.expiryDate}</div>}
      </div>

      <div className="payment-form__group">
        <label className="payment-form__label" htmlFor="cvv">CVV</label>
        <input
          type="text"
          id="cvv"
          name="cvv"
          className="payment-form__input"
          placeholder="123"
          value={formData.cvv}
          onChange={handleChange}
          maxLength="3"
          autoComplete="cc-csc"
        />
        {errors.cvv && <div style={errorStyle}>{errors.cvv}</div>}
      </div>
      
      <div className="payment-form__group payment-form__group--full" style={{ marginTop: '16px' }}>
        <label className="payment-form__label" htmlFor="email">Email para confirmación</label>
        <input
          type="email"
          id="email"
          name="email"
          className="payment-form__input"
          placeholder="usuario@email.com"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
        />
        {errors.email && <div style={errorStyle}>{errors.email}</div>}
      </div>

      <div className="payment-form__group--full">
        <button type="submit" className="payment-btn" disabled={isProcessing}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
          {isProcessing ? 'Procesando pago...' : `Pagar $${total}`}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
