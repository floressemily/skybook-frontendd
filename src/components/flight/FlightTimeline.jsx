// src/components/flight/FlightTimeline.jsx
// Timeline vertical con punto de salida, escalas y punto de llegada.
// Datos reales: aeropuertos, escalas, horas. Sin inventar nada.

import ScaleBlock from './ScaleBlock';

const norm = (obj, ...keys) => {
  if (!obj) return null;
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
    const lc = k.charAt(0).toLowerCase() + k.slice(1);
    if (obj[lc] != null) return obj[lc];
  }
  return null;
};

const formatHora = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const calcDuracion = (fechaSalida, fechaLlegada) => {
  if (!fechaSalida || !fechaLlegada) return null;
  const diff = new Date(fechaLlegada) - new Date(fechaSalida);
  if (isNaN(diff) || diff < 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
};

const FlightTimeline = ({ vuelo, escalas = [], aeropuertosEscalaMap = {}, origen, destino }) => {
  const fechaSalida  = norm(vuelo, 'fechaSalida',          'FechaSalida');
  const fechaLlegada = norm(vuelo, 'fechaLlegadaEstimada', 'FechaLlegadaEstimada');
  const duracion = calcDuracion(fechaSalida, fechaLlegada);

  const origenIATA    = norm(origen,  'codigoIATA', 'CodigoIATA') ?? '';
  const origenNombre  = norm(origen,  'nombre',     'Nombre')     ?? '';
  const destinoIATA   = norm(destino, 'codigoIATA', 'CodigoIATA') ?? '';
  const destinoNombre = norm(destino, 'nombre',     'Nombre')     ?? '';

  const escalasOrdenadas = [...escalas].sort(
    (a, b) => (norm(a, 'numeroOrden', 'NumeroOrden') ?? 0) - (norm(b, 'numeroOrden', 'NumeroOrden') ?? 0)
  );

  // Número de filas de línea (entre cada par de puntos)
  // origen → (escala 1 → escala N) → destino
  const segments = escalasOrdenadas.length + 1; // e.g. 1 si directo, 2 si 1 escala

  return (
    <div className="fd-card">
      <div className="fd-card__header">
        <svg className="fd-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="5" r="1" fill="currentColor"/>
          <line x1="12" y1="6" x2="12" y2="18"/>
          <circle cx="12" cy="19" r="1" fill="currentColor"/>
        </svg>
        <h2 className="fd-card__title">
          {escalasOrdenadas.length === 0
            ? 'Vuelo directo'
            : `Itinerario · ${escalasOrdenadas.length} escala${escalasOrdenadas.length > 1 ? 's' : ''}`}
        </h2>
        {escalasOrdenadas.length === 0 && (
          <span className="fd-tl-direct-badge" style={{ marginLeft: 'auto' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            Directo
          </span>
        )}
      </div>

      <div className="fd-timeline">
        {/* Columna izquierda: puntos y líneas */}
        <div className="fd-timeline__line-col">
          <div className="fd-dot" />
          {escalasOrdenadas.map((esc, i) => (
            <div key={norm(esc, 'escalaId', 'EscalaId') ?? i} style={{ display: 'contents' }}>
              <div className="fd-vline" />
              <div className="fd-dot" style={{ background: '#006CE4', boxShadow: '0 0 0 2px #006CE4' }} />
            </div>
          ))}
          <div className="fd-vline" />
          <div className="fd-dot fd-dot--end" />
        </div>

        {/* Columna derecha: eventos */}
        <div className="fd-timeline__events">
          {/* Salida */}
          <div className="fd-tl-event">
            <div className="fd-tl-event__time">{formatHora(fechaSalida)}</div>
            <div className="fd-tl-event__airport">
              {origenIATA && <span className="fd-tl-event__iata">{origenIATA} · </span>}
              {origenNombre || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Aeropuerto de origen</span>}
            </div>
          </div>

          {/* Escalas */}
          {escalasOrdenadas.map((esc, i) => {
            const aeroId = norm(esc, 'aeropuertoEscalaId', 'AeropuertoEscalaId');
            const aeroData = aeroId != null ? aeropuertosEscalaMap[aeroId] : null;
            return (
              <div key={norm(esc, 'escalaId', 'EscalaId') ?? i}>
                <div className="fd-tl-duration">
                  {i === 0 && duracion && (
                    <span className="fd-tl-duration__text">
                      Duración parcial →
                    </span>
                  )}
                </div>
                <ScaleBlock escala={esc} aeropuertoData={aeroData} />
              </div>
            );
          })}

          {/* Espaciado de duración si es directo */}
          {escalasOrdenadas.length === 0 && (
            <div className="fd-tl-duration">
              {duracion && <span className="fd-tl-duration__text">Duración total: {duracion}</span>}
            </div>
          )}

          {/* Llegada */}
          <div className="fd-tl-event">
            <div className="fd-tl-event__time">{formatHora(fechaLlegada)}</div>
            <div className="fd-tl-event__airport">
              {destinoIATA && <span className="fd-tl-event__iata">{destinoIATA} · </span>}
              {destinoNombre || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Aeropuerto de destino</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightTimeline;
