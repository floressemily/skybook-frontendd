// src/components/flight/AmenitiesRow.jsx
// NOTA: Las amenidades reales NO existen en la BD actual.
// Este componente muestra un aviso informativo y NO inventa datos como si fueran reales.

const AmenitiesRow = () => (
  <div className="fd-card">
    <div className="fd-card__header">
      <svg className="fd-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <h2 className="fd-card__title">Servicios a bordo</h2>
    </div>
    <div className="fd-card__body">
      <div className="fd-baggage-notice" style={{ background: '#F0F7FF', borderColor: '#93C5FD' }}>
        <svg className="fd-baggage-notice__icon" width="20" height="20" viewBox="0 0 24 24" fill="#1D4ED8">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <p className="fd-baggage-notice__text" style={{ color: '#1E40AF' }}>
          Los servicios a bordo (WiFi, entretenimiento, comida) dependen de la aerolínea y no están disponibles en el sistema actual.
          Podrás consultarlos directamente con la aerolínea operadora.
        </p>
      </div>
    </div>
  </div>
);

export default AmenitiesRow;
