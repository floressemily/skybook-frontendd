// src/pages/Confirmation.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

import SuccessHeader from '../components/confirmation/SuccessHeader';
import BookingReference from '../components/confirmation/BookingReference';
import ConfirmationItinerary from '../components/confirmation/ConfirmationItinerary';
import PostPurchaseActions from '../components/confirmation/PostPurchaseActions';

import '../styles/confirmation.css';

const Confirmation = () => {
  const navigate = useNavigate();
  const { reserva: ctxReserva, vueloSeleccionado: ctxVuelo, asientoSeleccionado: ctxAsiento, pago: ctxPago } = useBooking();
  
  const [data, setData] = React.useState(null);

  useEffect(() => {
    // 1. Intentar desde contexto
    if (ctxReserva && ctxVuelo) {
      setData({
        pnr: ctxReserva.CodigoReserva,
        email: ctxReserva.email,
        total: ctxPago?.total || ctxReserva.Total,
        vueloInfo: ctxVuelo,
        asientoInfo: ctxAsiento,
        metodo: ctxPago?.metodo,
        tarjeta: ctxPago?.tarjeta,
        fecha: new Date().toISOString()
      });
    } 
    // 2. Si no hay contexto, intentar desde sessionStorage
    else {
      const savedData = sessionStorage.getItem('confirmacion_reserva');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setData(parsed);
        // Opcional: limpiar después de leer si no queremos que persista más
        // sessionStorage.removeItem('confirmacion_reserva');
      }
    }
  }, [ctxReserva, ctxVuelo, ctxAsiento, ctxPago]);

  if (!data) {
    return (
      <div className="confirmation-page" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>😕</div>
          <h2 style={{ color: '#1A1A1A', marginBottom: '10px' }}>No hay datos de reserva</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>No pudimos encontrar la información de tu confirmación. Esto puede ocurrir si recargas la página.</p>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: '12px 24px', backgroundColor: '#006CE4', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        
        <SuccessHeader email={data.email} />
        
        <BookingReference code={data.pnr} />
        
        <ConfirmationItinerary 
          vueloInfo={data.vueloInfo || {
            numeroVuelo: data.numeroVuelo,
            aerolinea: data.aerolinea,
            origenNombre: data.origen,
            destinoNombre: data.destino
          }} 
          asientoInfo={data.asientoInfo}
          totalPagado={data.total}
          metodoPago={data.metodo ? `${data.metodo} (**** ${data.tarjeta})` : null}
        />

        <div style={{ textAlign: 'center', marginTop: '24px', color: '#666', fontSize: '13px' }}>
          Fecha de transacción: {new Date(data.fecha).toLocaleString('es-EC')}
        </div>
        
        <PostPurchaseActions />
        
      </div>
    </div>
  );
};

export default Confirmation;
