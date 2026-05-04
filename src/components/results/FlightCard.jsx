// src/components/results/FlightCard.jsx
// Campos usados: exactamente los que devuelven los endpoints reales.
// Precio: viene de precioBase / PrecioBase (oper.Ruta.TarifaBase via API).
//   Si es null → "Precio no disponible". NO se inventan precios.
// Escalas: vienen del escalasMap cargado en Results.jsx
// AsientosDisponibles: de asientosMap (calculado desde AsientoVuelo.Estado = DISPONIBLE)

import { useNavigate } from 'react-router-dom';
import { calcularPrecio } from '../../utils/precioUtils';

// ── Utilidades ────────────────────────────────────────────────────────────────
const norm = (obj, ...keys) => {
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
    const lc = k.charAt(0).toLowerCase() + k.slice(1);
    if (obj[lc] != null) return obj[lc];
  }
  return null;
};

const calcDuracion = (fechaSalida, fechaLlegada) => {
  if (!fechaSalida || !fechaLlegada) return '—';
  const diff = new Date(fechaLlegada) - new Date(fechaSalida);
  if (isNaN(diff) || diff < 0) return '—';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
};

const formatHora = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatFecha = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
};

const getInitials = (nombre = '') => {
  const w = nombre.trim().split(' ');
  if (w.length === 1) return nombre.substring(0, 2).toUpperCase();
  return (w[0][0] + w[1][0]).toUpperCase();
};

// ── Componente ────────────────────────────────────────────────────────────────
const FlightCard = ({ vuelo, ruta, escalas = [], asientosDisponibles }) => {
  const navigate = useNavigate();

  // DEBUG: log del primer vuelo y su ruta para verificar datos de la API
  if (process.env.NODE_ENV !== 'production') {
    console.log('[FlightCard] vuelo:', JSON.stringify(vuelo, null, 2));
    console.log('[FlightCard] ruta:', JSON.stringify(ruta, null, 2));
  }

  // Normalizar campos (la API puede responder en camelCase o PascalCase)
  const vueloId               = norm(vuelo, 'vueloId',               'VueloId');
  const numeroVuelo           = norm(vuelo, 'numeroVuelo',           'NumeroVuelo')           ?? '—';
  const aerolineaOperadora    = norm(vuelo, 'aerolineaOperadora',    'AerolineaOperadora')    ?? '—';
  const aerolineaComercial    = norm(vuelo, 'aerolineaComercializadora', 'AerolineaComercializadora');
  const fechaSalida           = norm(vuelo, 'fechaSalida',           'FechaSalida');
  const fechaLlegada          = norm(vuelo, 'fechaLlegadaEstimada',  'FechaLlegadaEstimada');
  const estado                = norm(vuelo, 'estado',                'Estado');
  const observaciones         = norm(vuelo, 'observaciones',         'Observaciones');
  const origenIATA            = norm(vuelo, 'origen',                'Origen')                ?? '';
  const destinoIATA           = norm(vuelo, 'destino',               'Destino')               ?? '';
  const avionInfo             = norm(vuelo, 'avion',                 'Avion');
  // Precio: viene de ruta (pasada desde rutasMap en Results.jsx)
  // Prioridad: ruta.precioBase (TarifaBase en BD) → calcularPrecio(ruta) → null
  const precioBase            = ruta
    ? (ruta.precioBase ?? ruta.PrecioBase ?? calcularPrecio(ruta))
    : null;

  const duracion = calcDuracion(fechaSalida, fechaLlegada);

  const stopPositions = escalas.map((_, i) =>
    Math.round(((i + 1) / (escalas.length + 1)) * 100)
  );

  const handleSelect = (e) => {
    e.stopPropagation();
    navigate(`/flight/${vueloId}`);
  };

  return (
    <div
      className="flight-card"
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleSelect(e)}
      aria-label={`Vuelo ${numeroVuelo} de ${aerolineaOperadora}`}
    >
      <div className="flight-card__body">

        {/* Fila principal */}
        <div className="fc-flight-row">

          {/* Aerolínea */}
          <div className="fc-airline">
            <div className="fc-airline__logo-placeholder">
              {getInitials(aerolineaOperadora)}
            </div>
            <span className="fc-airline__name">{aerolineaOperadora}</span>
            {aerolineaComercial && aerolineaComercial !== aerolineaOperadora && (
              <span className="fc-airline__comercial">Op. {aerolineaComercial}</span>
            )}
            <span className="fc-airline__flight">{numeroVuelo}</span>
          </div>

          {/* Timeline */}
          <div className="fc-timeline">

            {/* Salida */}
            <div className="fc-time-block">
              <span className="fc-time">{formatHora(fechaSalida)}</span>
              <span className="fc-date">{formatFecha(fechaSalida)}</span>
              {origenIATA && <span className="fc-iata">{origenIATA}</span>}
            </div>

            {/* Línea con escalas */}
            <div className="fc-line-wrap">
              <div className="fc-line">
                {stopPositions.map((pos, i) => (
                  <span
                    key={escalas[i]?.escalaId ?? escalas[i]?.EscalaId ?? i}
                    className="fc-stop-dot"
                    style={{ left: `${pos}%` }}
                    title={`Escala ${norm(escalas[i], 'numeroOrden', 'NumeroOrden')}`}
                  />
                ))}
              </div>
              <div className="fc-duration-center">{duracion}</div>
              {escalas.length > 0 ? (
                <div className="fc-stop-labels">
                  {escalas.map((esc, i) => {
                    const espera = norm(esc, 'tiempoEsperaMin', 'TiempoEsperaMin');
                    const orden = norm(esc, 'numeroOrden', 'NumeroOrden');
                    return (
                      <span key={esc?.escalaId ?? esc?.EscalaId ?? i} className="fc-stop-label">
                        Escala {orden}
                        {espera ? ` · ${espera} min` : ''}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="fc-nonstop">Vuelo directo</span>
              )}
            </div>

            {/* Llegada */}
            <div className="fc-time-block">
              <span className="fc-time">{formatHora(fechaLlegada)}</span>
              <span className="fc-date">{formatFecha(fechaLlegada)}</span>
              {destinoIATA && <span className="fc-iata">{destinoIATA}</span>}
            </div>
          </div>

          {/* Duración + escalas resumen */}
          <div className="fc-duration">
            <div className="fc-duration__time">{duracion}</div>
            <div className="fc-duration__stops">
              {escalas.length === 0
                ? 'Directo'
                : `${escalas.length} escala${escalas.length > 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        {/* Fila de metadatos */}
        <div className="fc-meta-row">
          {/* Estado */}
          {estado && (
            <span className={`fc-estado fc-estado--${estado.toLowerCase()}`}>
              {estado}
            </span>
          )}
          {/* Avión */}
          {avionInfo && (
            <span className="fc-avion">
              {avionInfo.modelo ?? avionInfo.Modelo ?? avionInfo.matricula ?? avionInfo.Matricula ?? 'Avión disponible'}
            </span>
          )}
          {/* Asientos disponibles */}
          {asientosDisponibles != null && (
            <span className={`fc-asientos ${asientosDisponibles < 5 ? 'fc-asientos--low' : ''}`}>
              {asientosDisponibles < 5
                ? `¡Solo ${asientosDisponibles} asiento${asientosDisponibles !== 1 ? 's' : ''}!`
                : `${asientosDisponibles} asientos disponibles`}
            </span>
          )}
          {/* Observaciones */}
          {observaciones && (
            <span className="fc-obs">{observaciones}</span>
          )}
        </div>
      </div>

      {/* Bloque de precio */}
      <div className="flight-card__price-block">
        <span className="fc-price-label">por persona</span>
        {precioBase != null ? (
          <>
            <span className="fc-price">${Number(precioBase).toFixed(2)}</span>
            <span className="fc-price-note">Tarifa base</span>
          </>
        ) : (
          <span className="fc-price-unavailable">Precio no<br/>disponible</span>
        )}
        <button type="button" className="fc-select-btn" onClick={handleSelect}>
          Seleccionar
        </button>
      </div>
    </div>
  );
};

export default FlightCard;