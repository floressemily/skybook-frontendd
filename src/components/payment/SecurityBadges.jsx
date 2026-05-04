// src/components/payment/SecurityBadges.jsx
import React from 'react';

const SecurityBadges = () => {
  return (
    <div className="security-badges">
      <div className="security-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#008009">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
        </svg>
        SSL Secure
      </div>
      <div className="security-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#008009">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
        </svg>
        PCI Compliance
      </div>
    </div>
  );
};

export default SecurityBadges;
