// src/components/flight/AircraftInfo.jsx
// Datos reales del avión: fabricante, modelo, matrícula, capacidad, tipo fuselaje.
// Sin logos inventados. Si un dato no existe → "No disponible".

const norm = (obj, ...keys) => {
  if (!obj) return null;
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
    const lc = k.charAt(0).toLowerCase() + k.slice(1);
    if (obj[lc] != null) return obj[lc];
  }
  return null;
};

const NA = <span className="fd-na">No disponible</span>;

const AircraftInfo = ({ avion }) => {
  const fabricante    = norm(avion, 'fabricante',    'Fabricante');
  const modelo        = norm(avion, 'modelo',        'Modelo');
  const matricula     = norm(avion, 'matricula',     'Matricula');
  const capacidad     = norm(avion, 'capacidadTotal','CapacidadTotal');
  const fuselaje      = norm(avion, 'tipoFuselaje',  'TipoFuselaje');
  const filas         = norm(avion, 'filasTotales',  'FilasTotales');
  const columnas      = norm(avion, 'columnasTotales','ColumnasTotales');
  const estadoAvion   = norm(avion, 'estado',        'Estado');

  return (
    <div className="fd-card">
      <div className="fd-card__header">
        <svg className="fd-card__icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
        <h2 className="fd-card__title">Información de la aeronave</h2>
      </div>
      <div className="fd-card__body">
        <div className="fd-aircraft-grid">
          <div className="fd-aircraft-item">
            <div className="fd-aircraft-item__label">Fabricante</div>
            <div className="fd-aircraft-item__value">{fabricante ?? NA}</div>
          </div>
          <div className="fd-aircraft-item">
            <div className="fd-aircraft-item__label">Modelo</div>
            <div className="fd-aircraft-item__value">{modelo ?? NA}</div>
          </div>
          <div className="fd-aircraft-item">
            <div className="fd-aircraft-item__label">Matrícula</div>
            <div className="fd-aircraft-item__value">{matricula ?? NA}</div>
          </div>
          <div className="fd-aircraft-item">
            <div className="fd-aircraft-item__label">Capacidad total</div>
            <div className="fd-aircraft-item__value">
              {capacidad != null ? `${capacidad} pasajeros` : NA}
            </div>
          </div>
          <div className="fd-aircraft-item">
            <div className="fd-aircraft-item__label">Tipo de fuselaje</div>
            <div className="fd-aircraft-item__value">{fuselaje ?? NA}</div>
          </div>
          {(filas != null || columnas != null) && (
            <div className="fd-aircraft-item">
              <div className="fd-aircraft-item__label">Distribución</div>
              <div className="fd-aircraft-item__value">
                {filas != null && columnas != null
                  ? `${filas} filas × ${columnas} columnas`
                  : filas != null ? `${filas} filas` : `${columnas} columnas`}
              </div>
            </div>
          )}
          {estadoAvion && (
            <div className="fd-aircraft-item">
              <div className="fd-aircraft-item__label">Estado aeronave</div>
              <div className="fd-aircraft-item__value">{estadoAvion}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AircraftInfo;
