// src/components/payment/PaymentMethodTabs.jsx
import React from 'react';

const PaymentMethodTabs = ({ selectedMethod, onSelect }) => {
  const methods = [
    { id: 'visa', name: 'Visa' },
    { id: 'mastercard', name: 'Mastercard' },
    { id: 'amex', name: 'Amex' },
    { id: 'paypal', name: 'PayPal' },
  ];

  return (
    <div className="payment-tabs">
      {methods.map((method) => (
        <div
          key={method.id}
          className={`payment-tab ${selectedMethod === method.id ? 'payment-tab--active' : ''}`}
          onClick={() => onSelect(method.id)}
        >
          {selectedMethod === method.id && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          )}
          {method.name}
        </div>
      ))}
    </div>
  );
};

export default PaymentMethodTabs;
