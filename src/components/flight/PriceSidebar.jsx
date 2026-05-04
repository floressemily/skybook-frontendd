// src/components/flight/PriceSidebar.jsx
// Resumen de precio con datos reales: precioBase (ruta) + precioAdicionalAsiento.
// Tasas: NO existen antes de reserva → informativo.
// CTA: "Ir a datos del pasajero" → guarda en BookingContext y navega a /payment.

import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { calcularPrecio } from '../../utils/precioUtils';

const NA = <span className="fd-na">No disponible</span>;

const formatMoney = (v) => {
  if (v == null) return null;
  const n = Number(v);
  if (isNaN(n)) return null;
  return `$${n.toFixed(2)}`;
};

const PriceSidebar = ({
  vuelo,
  ruta,
  origen,
  destino,
  avion,
  asientoSeleccionado,
  onContinuar,
}) => {
  const navigate  = useNavigate();
  const { setVueloSeleccionado, setAsientoSeleccionado } = useBooking();

  const precioBase       = ruta?.precioBase       ?? ruta?.PrecioBase       ?? calcularPrecio(ruta);
  const precioAdicional  = asientoSeleccionado?.precioAdicional ?? 0;

  const totalTemporal =
    precioBase != null ? (Number(precioBase) + Number(precioAdicional)) : null;

  // DEBUG: verificar datos de ruta y precio
  if (process.env.NODE_ENV !== 'production') {
    console.log('[PriceSidebar] ruta:', ruta, '| precioBase:', precioBase);
  }

  const handleContinuar = () => {
    // Guardar todo en BookingContext
    const bookingData = {
      vueloId:            vuelo?.vueloId           ?? vuelo?.VueloId,
      rutaId:             vuelo?.rutaId             ?? vuelo?.RutaId,
      avionId:            vuelo?.avionId            ?? vuelo?.AvionId,
      numeroVuelo:        vuelo?.numeroVuelo        ?? vuelo?.NumeroVuelo,
      aerolinea:          vuelo?.aerolineaOperadora ?? vuelo?.AerolineaOperadora,
      fechaSalida:        vuelo?.fechaSalida        ?? vuelo?.FechaSalida,
      fechaLlegada:       vuelo?.fechaLlegadaEstimada ?? vuelo?.FechaLlegadaEstimada,
      estado:             vuelo?.estado             ?? vuelo?.Estado,
      origenId:           origen?.aeropuertoId      ?? origen?.AeropuertoId,
      origenNombre:       origen?.nombre            ?? origen?.Nombre,
      origenIATA:         origen?.codigoIATA        ?? origen?.CodigoIATA ?? '',
      destinoId:          destino?.aeropuertoId     ?? destino?.AeropuertoId,
      destinoNombre:      destino?.nombre           ?? destino?.Nombre,
      destinoIATA:        destino?.codigoIATA       ?? destino?.CodigoIATA ?? '',
      precioBase,
      ruta,                // ← para que Payment pueda usar calcularPrecio(vueloInfo.ruta)
      modeloAvion:        avion?.modelo             ?? avion?.Modelo,
      matriculaAvion:     avion?.matricula          ?? avion?.Matricula,
      totalTemporal,
    };

    setVueloSeleccionado(bookingData);
    setAsientoSeleccionado(asientoSeleccionado ?? null);

    // También en sessionStorage (persistencia en reload)
    sessionStorage.setItem('booking_vuelo',   JSON.stringify(bookingData));
    sessionStorage.setItem('booking_asiento', JSON.stringify(asientoSeleccionado ?? null));

    if (onContinuar) onContinuar();
    navigate('/payment');
  };

  const puedeContinar = true; // siempre puede continuar, pero mostramos aviso si no hay asiento

  return (
    <div className="fd-sidebar">
      <div className="fd-price-card">
        <div className="fd-price-card__header">
          <h3 className="fd-price-card__title">Resumen de compra</h3>
        </div>
        <div className="fd-price-card__body">

          {/* Tarifa base */}
          <div className="fd-price-row">
            <span className="fd-price-row__label">Tarifa base</span>
            <span className="fd-price-row__value">
              {formatMoney(precioBase) ?? NA}
            </span>
          </div>

          {/* Asiento seleccionado */}
          <div className="fd-price-row">
            <span className="fd-price-row__label">
              {asientoSeleccionado
                ? `Asiento ${asientoSeleccionado.numeroAsiento}`
                : 'Asiento'}
            </span>
            <span className="fd-price-row__value">
              {asientoSeleccionado
                ? (Number(precioAdicional) === 0
                    ? 'Sin costo'
                    : `+${formatMoney(precioAdicional)}`)
                : <span style={{ color: '#aaa', fontStyle: 'italic', fontSize: 12 }}>No seleccionado</span>}
            </span>
          </div>

          {/* Tasas (no existen antes de reserva) */}
          <div className="fd-price-row fd-price-row--note">
            <span className="fd-price-row__label">Tasas e impuestos</span>
            <span className="fd-price-row__value">Se calculan en reserva</span>
          </div>

          <hr className="fd-price-divider" />

          {/* Total */}
          <div className="fd-price-total">
            <span className="fd-price-total__label">Total estimado</span>
            {totalTemporal != null
              ? <span className="fd-price-total__value">{formatMoney(totalTemporal)}</span>
              : <span className="fd-price-total__na">No disponible</span>}
          </div>
          {totalTemporal != null && (
            <p className="fd-price-note-bottom">
              * Precio estimado. El total final se confirmará al completar la reserva.
            </p>
          )}

          {/* CTA */}
          <button
            id="btn-continuar-pago"
            className="fd-cta-btn"
            onClick={handleContinuar}
            type="button"
          >
            Ir a datos del pasajero
          </button>

          {/* Aviso sin asiento */}
          {!asientoSeleccionado && (
            <div className="fd-no-seat-notice">
              Puedes seleccionar asiento ahora o continuar sin asiento y elegirlo más adelante.
            </div>
          )}

          {/* Sellos de confianza */}
          <div className="fd-trust-row">
            <div className="fd-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
              Pago 100% seguro
            </div>
            <div className="fd-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              Sin cargos ocultos
            </div>
            <div className="fd-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Confirmación inmediata
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSidebar;
