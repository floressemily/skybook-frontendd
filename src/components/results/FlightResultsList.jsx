// src/components/results/FlightResultsList.jsx
// Renderiza la lista de FlightCard con los estados de carga/error/vacío.
// asientosMap: { vueloId: number } — disponibles por vuelo

import FlightCard from './FlightCard';

const norm = (obj, ...keys) => {
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
    const lc = k.charAt(0).toLowerCase() + k.slice(1);
    if (obj[lc] != null) return obj[lc];
  }
  return null;
};

const FlightResultsList = ({
  vuelos = [],
  escalasMap = {},
  asientosMap = {},
  aeropuertos = {},
  rutasMap = {},
  activeSort,
  loading,
  error,
}) => {

  if (loading) {
    return (
      <div className="results-loading">
        <div className="results-spinner" />
        <span className="results-loading__text">Buscando vuelos disponibles…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-state results-state--error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#E53935">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <p className="results-state__title">Sin conexión con la API</p>
        <p className="results-state__sub">
          No pudimos conectar con el servidor. Mostrando datos de demostración.
        </p>
      </div>
    );
  }

  if (!vuelos.length) {
    return (
      <div className="results-state results-state--empty">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="#B0BEC5">
          <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
        <p className="results-state__title">No encontramos vuelos</p>
        <p className="results-state__sub">
          No encontramos vuelos para esta búsqueda.<br/>
          Intenta cambiar el origen, destino o fecha.
        </p>
      </div>
    );
  }

  return (
    <div className="flight-cards-list">
      {vuelos.map((vuelo, idx) => {
        const id    = norm(vuelo, 'vueloId', 'VueloId');
        const rutaId = norm(vuelo, 'rutaId', 'RutaId');
        return (
          <FlightCard
            key={id ?? idx}
            vuelo={vuelo}
            ruta={rutasMap[rutaId] ?? null}
            escalas={escalasMap[id] ?? []}
            asientosDisponibles={asientosMap[id] ?? null}
            aeropuertos={aeropuertos}
          />
        );
      })}
    </div>
  );
};

export default FlightResultsList;