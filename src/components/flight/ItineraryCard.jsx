// src/components/flight/ItineraryCard.jsx
// Muestra datos reales del vuelo: aerolínea, número, fechas, avión.
// NADA inventado. Si un dato falta → "No disponible".

const norm = (obj, ...keys) => {
  if (!obj) return null;
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
    const lc = k.charAt(0).toLowerCase() + k.slice(1);
    if (obj[lc] != null) return obj[lc];
  }
  return null;
};

const formatFechaHora = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return {
    hora: d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false }),
    fecha: d.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
};

const calcDuracion = (fechaSalida, fechaLlegada) => {
  if (!fechaSalida || !fechaLlegada) return null;
  const diff = new Date(fechaLlegada) - new Date(fechaSalida);
  if (isNaN(diff) || diff < 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
};

const getInitials = (nombre = '') => {
  const w = nombre.trim().split(/\s+/);
  if (w.length >= 2) return (w[0][0] + w[1][0]).toUpperCase();
  return nombre.substring(0, 2).toUpperCase();
};

const NA = <span className="fd-na">No disponible</span>;

const ItineraryCard = ({ vuelo, avion, origen, destino }) => {
  const aerolinea      = norm(vuelo, 'aerolineaOperadora')    ?? norm(vuelo, 'AerolineaOperadora');
  const aerolineaCom   = norm(vuelo, 'aerolineaComercializadora') ?? norm(vuelo, 'AerolineaComercializadora');
  const numeroVuelo    = norm(vuelo, 'numeroVuelo')            ?? norm(vuelo, 'NumeroVuelo');
  const fechaSalida    = norm(vuelo, 'fechaSalida')            ?? norm(vuelo, 'FechaSalida');
  const fechaLlegada   = norm(vuelo, 'fechaLlegadaEstimada')   ?? norm(vuelo, 'FechaLlegadaEstimada');
  const observaciones  = norm(vuelo, 'observaciones')          ?? norm(vuelo, 'Observaciones');

  const salida  = formatFechaHora(fechaSalida);
  const llegada = formatFechaHora(fechaLlegada);
  const duracion = calcDuracion(fechaSalida, fechaLlegada);

  const origenIATA  = norm(origen,  'codigoIATA') ?? norm(origen,  'CodigoIATA') ?? '';
  const destinoIATA = norm(destino, 'codigoIATA') ?? norm(destino, 'CodigoIATA') ?? '';
  const origenNombre  = norm(origen,  'nombre') ?? norm(origen,  'Nombre');
  const destinoNombre = norm(destino, 'nombre') ?? norm(destino, 'Nombre');

  const modeloAvion    = norm(avion, 'modelo')    ?? norm(avion, 'Modelo');
  const fabricante     = norm(avion, 'fabricante') ?? norm(avion, 'Fabricante');
  const avionLabel     = avion
    ? [fabricante, modeloAvion].filter(Boolean).join(' ') || 'Avión disponible'
    : null;

  const initials = aerolinea ? getInitials(aerolinea) : '??';

  return (
    <div className="fd-card">
      <div className="fd-card__header">
        <svg className="fd-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
        <h2 className="fd-card__title">Vuelo seleccionado</h2>
      </div>
      <div className="fd-card__body">
        {/* Aerolínea */}
        <div className="fd-airline-row">
          <div className="fd-airline-badge">{initials}</div>
          <div className="fd-airline-info">
            <div className="fd-airline-info__name">
              {aerolinea ?? NA}
              {aerolineaCom && aerolineaCom !== aerolinea && (
                <span style={{ fontSize: 11, color: '#999', marginLeft: 6 }}>
                  Op. {aerolineaCom}
                </span>
              )}
            </div>
            <div className="fd-airline-info__num">
              {numeroVuelo ? `Vuelo ${numeroVuelo}` : NA}
              {avionLabel && <span style={{ marginLeft: 12 }}>{avionLabel}</span>}
            </div>
          </div>
        </div>

        {/* Metadatos en grid */}
        <div className="fd-meta-grid">
          <div className="fd-meta-item">
            <div className="fd-meta-item__label">Salida</div>
            <div className="fd-meta-item__value">{salida?.hora ?? NA}</div>
            <div className="fd-meta-item__sub">{salida?.fecha ?? ''}</div>
          </div>
          <div className="fd-meta-item">
            <div className="fd-meta-item__label">Llegada estimada</div>
            <div className="fd-meta-item__value">{llegada?.hora ?? NA}</div>
            <div className="fd-meta-item__sub">{llegada?.fecha ?? ''}</div>
          </div>
          <div className="fd-meta-item">
            <div className="fd-meta-item__label">Duración</div>
            <div className="fd-meta-item__value">{duracion ?? NA}</div>
          </div>
          <div className="fd-meta-item">
            <div className="fd-meta-item__label">Origen</div>
            <div className="fd-meta-item__value">
              {origenIATA ? <strong>{origenIATA}</strong> : NA}
            </div>
            {origenNombre && <div className="fd-meta-item__sub">{origenNombre}</div>}
          </div>
          <div className="fd-meta-item">
            <div className="fd-meta-item__label">Destino</div>
            <div className="fd-meta-item__value">
              {destinoIATA ? <strong>{destinoIATA}</strong> : NA}
            </div>
            {destinoNombre && <div className="fd-meta-item__sub">{destinoNombre}</div>}
          </div>
          <div className="fd-meta-item">
            <div className="fd-meta-item__label">Avión</div>
            <div className="fd-meta-item__value">{avionLabel ?? NA}</div>
          </div>
        </div>

        {/* Observaciones si vienen de API */}
        {observaciones && (
          <p style={{ marginTop: 14, fontSize: 12, color: '#666', borderTop: '1px solid #E7E7E7', paddingTop: 12 }}>
            Nota: {observaciones}
          </p>
        )}
      </div>
    </div>
  );
};

export default ItineraryCard;
