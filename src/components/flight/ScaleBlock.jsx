// src/components/flight/ScaleBlock.jsx
// Bloque intermedio de escala dentro del timeline.
// Alerta naranja si tiempoEsperaMin >= 180.

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
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const ScaleBlock = ({ escala, aeropuertoData }) => {
  const orden      = norm(escala, 'numeroOrden',             'NumeroOrden')             ?? '';
  const espera     = norm(escala, 'tiempoEsperaMin',         'TiempoEsperaMin');
  const recoger    = norm(escala, 'requiereRecogerEquipaje', 'RequiereRecogerEquipaje');
  const llegadaEsc = norm(escala, 'fechaLlegadaEstimada',    'FechaLlegadaEstimada');
  const salidaEsc  = norm(escala, 'fechaSalidaEstimada',     'FechaSalidaEstimada');
  const estadoEsc  = norm(escala, 'estado',                  'Estado');

  const iataEsc   = norm(aeropuertoData, 'codigoIATA', 'CodigoIATA') ?? '';
  const nombreEsc = norm(aeropuertoData, 'nombre',     'Nombre');

  const esLarga = espera != null && espera >= 180;

  const llegHora = formatHora(llegadaEsc);
  const salHora  = formatHora(salidaEsc);

  return (
    <div className="fd-scale-block">
      <div className="fd-scale-block__title">
        Escala {orden}
        {estadoEsc && (
          <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 400, color: '#666' }}>
            ({estadoEsc})
          </span>
        )}
      </div>
      <div className="fd-scale-block__airport">
        {iataEsc && <span style={{ fontWeight: 800 }}>{iataEsc} · </span>}
        {nombreEsc ?? <span style={{ color: '#aaa', fontStyle: 'italic' }}>Aeropuerto no disponible</span>}
      </div>
      {(llegHora || salHora) && (
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          {llegHora && <span>Llegada: {llegHora}</span>}
          {llegHora && salHora && <span style={{ margin: '0 8px' }}>·</span>}
          {salHora && <span>Salida: {salHora}</span>}
        </div>
      )}
      <div className="fd-scale-block__wait">
        {espera != null
          ? `Tiempo de espera: ${Math.floor(espera / 60)}h ${espera % 60}m (${espera} min)`
          : 'Tiempo de espera: No disponible'}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        {esLarga && (
          <span className="fd-scale-block__alert">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            Escala larga
          </span>
        )}
        {recoger && (
          <span className="fd-scale-block__recoger">Recoger equipaje</span>
        )}
      </div>
    </div>
  );
};

export default ScaleBlock;
