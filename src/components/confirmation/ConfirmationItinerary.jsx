// src/components/confirmation/ConfirmationItinerary.jsx
import React from 'react';

const ConfirmationItinerary = ({ vueloInfo, asientoInfo, totalPagado, metodoPago }) => {
  if (!vueloInfo) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatMoney = (v) => {
    if (v == null) return 'No disponible';
    const n = Number(v);
    if (isNaN(n)) return 'No disponible';
    return `$${n.toFixed(2)}`;
  };

  return (
    <div className="confirmation-itinerary">
      <h3 className="confirmation-itinerary__title">Resumen del itinerario</h3>
      
      <div className="confirmation-itinerary__grid">
        <div className="confirmation-itinerary__item">
          <span className="confirmation-itinerary__label">Ruta</span>
          <span className="confirmation-itinerary__value">
            {vueloInfo.origenIATA || vueloInfo.origenNombre} → {vueloInfo.destinoIATA || vueloInfo.destinoNombre}
          </span>
        </div>
        
        <div className="confirmation-itinerary__item">
          <span className="confirmation-itinerary__label">Vuelo</span>
          <span className="confirmation-itinerary__value">
            {vueloInfo.aerolinea} {vueloInfo.numeroVuelo}
          </span>
        </div>

        <div className="confirmation-itinerary__item">
          <span className="confirmation-itinerary__label">Salida</span>
          <span className="confirmation-itinerary__value">
            {formatDate(vueloInfo.fechaSalida)}
          </span>
        </div>

        <div className="confirmation-itinerary__item">
          <span className="confirmation-itinerary__label">Llegada</span>
          <span className="confirmation-itinerary__value">
            {formatDate(vueloInfo.fechaLlegada)}
          </span>
        </div>

        {asientoInfo && (
          <div className="confirmation-itinerary__item">
            <span className="confirmation-itinerary__label">Asiento</span>
            <span className="confirmation-itinerary__value">
              {asientoInfo.numeroAsiento}
            </span>
          </div>
        )}

        <div className="confirmation-itinerary__item">
          <span className="confirmation-itinerary__label">Método de pago</span>
          <span className="confirmation-itinerary__value" style={{ textTransform: 'capitalize' }}>
            {metodoPago || 'No especificado'}
          </span>
        </div>

        <div className="confirmation-itinerary__item">
          <span className="confirmation-itinerary__label">Total pagado</span>
          <span className="confirmation-itinerary__value">
            {formatMoney(totalPagado)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationItinerary;
