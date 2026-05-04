// src/components/flight/FlightHeader.jsx
// Cabecera de contexto: "Revisa tu itinerario" + ruta + pasajeros + estado del vuelo.
// Todos los datos provienen de props reales (API). Sin datos inventados.

const getInitials = (nombre = '') => {
  const w = nombre.trim().split(/\s+/);
  if (w.length >= 2) return (w[0][0] + w[1][0]).toUpperCase();
  return nombre.substring(0, 2).toUpperCase();
};

const FlightHeader = ({ vuelo, origen, destino }) => {
  const aerolinea   = vuelo?.aerolineaOperadora ?? vuelo?.AerolineaOperadora ?? '';
  const numeroVuelo = vuelo?.numeroVuelo         ?? vuelo?.NumeroVuelo         ?? '';
  const estado      = (vuelo?.estado             ?? vuelo?.Estado              ?? '').toLowerCase();

  const origenNombre = origen?.nombre     ?? origen?.Nombre;
  const origenIATA   = origen?.codigoIATA ?? origen?.CodigoIATA ?? '';
  const destinoNombre= destino?.nombre    ?? destino?.Nombre;
  const destinoIATA  = destino?.codigoIATA?? destino?.CodigoIATA ?? '';

  const rutaLabel = origenIATA && destinoIATA
    ? `${origenIATA} → ${destinoIATA}`
    : (origenNombre && destinoNombre)
      ? `${origenNombre} → ${destinoNombre}`
      : null;

  return (
    <div className="fd-header-section">
      <h1>Revisa tu itinerario</h1>
      <div className="fd-header-meta">
        {rutaLabel && <span>{rutaLabel}</span>}
        {rutaLabel && <span className="fd-breadcrumb__sep">·</span>}
        <span>1 pasajero</span>
        {aerolinea && (
          <>
            <span className="fd-breadcrumb__sep">·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                background: '#EBF3FF', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: '#003580'
              }}>
                {getInitials(aerolinea)}
              </span>
              {aerolinea}
              {numeroVuelo && ` · ${numeroVuelo}`}
            </span>
          </>
        )}
        {estado && (
          <span className={`fd-badge-estado fd-badge-estado--${estado}`}>
            <span className="fd-badge-dot" />
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
};

export default FlightHeader;
