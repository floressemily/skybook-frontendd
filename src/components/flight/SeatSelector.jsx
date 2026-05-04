// src/components/flight/SeatSelector.jsx
import React from 'react';
// Selector de asiento con datos reales de /api/v1/asientovuelo/por-vuelo/{vueloId}.
// Renderiza grid visual (filas × columnas del avión si disponible) o lista de pills.
// Solo permite seleccionar DISPONIBLE. Ocupa/Reservado/Bloqueado = deshabilitado.

const norm = (obj, ...keys) => {
  if (!obj) return null;
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
    const lc = k.charAt(0).toLowerCase() + k.slice(1);
    if (obj[lc] != null) return obj[lc];
  }
  return null;
};

const ESTADO = {
  DISPONIBLE: 'DISPONIBLE',
  RESERVADO:  'RESERVADO',
  OCUPADO:    'OCUPADO',
  BLOQUEADO:  'BLOQUEADO',
};

const formatPrecio = (v) => {
  if (v == null) return null;
  const n = Number(v);
  if (isNaN(n)) return null;
  return n === 0 ? 'Sin costo' : `+$${n.toFixed(2)}`;
};

// ── Componente principal ──────────────────────────────────────────────────────
const SeatSelector = ({ asientos = [], avion = null, asientoSeleccionado, onSelect }) => {
  const totalDisponibles = asientos.filter(
    a => (norm(a, 'estado', 'Estado') ?? '').toUpperCase() === ESTADO.DISPONIBLE
  ).length;

  const filasTotales   = norm(avion, 'filasTotales',    'FilasTotales');
  const columnasTotales= norm(avion, 'columnasTotales', 'ColumnasTotales');

  // Decidir si renderizamos grid visual o lista de pills
  const usarGrid = filasTotales != null && columnasTotales != null && asientos.length > 0;

  const handleClick = (asiento) => {
    const estado = (norm(asiento, 'estado', 'Estado') ?? '').toUpperCase();
    if (estado !== ESTADO.DISPONIBLE) return;
    const id = norm(asiento, 'asientoVueloId', 'AsientoVueloId');
    if (asientoSeleccionado?.asientoVueloId === id) {
      onSelect(null); // deseleccionar
    } else {
      onSelect({
        asientoVueloId:   id,
        numeroAsiento:    norm(asiento, 'numeroAsiento',  'NumeroAsiento'),
        clase:            norm(asiento, 'clase',          'Clase'),
        tipoAsiento:      norm(asiento, 'tipoAsiento',    'TipoAsiento'),
        precioAdicional:  norm(asiento, 'precioAdicional','PrecioAdicional') ?? 0,
      });
    }
  };

  const getSeatClass = (asiento) => {
    const id = norm(asiento, 'asientoVueloId', 'AsientoVueloId');
    if (asientoSeleccionado?.asientoVueloId === id) return 'fd-seat fd-seat--selected';
    const est = (norm(asiento, 'estado', 'Estado') ?? '').toUpperCase();
    switch (est) {
      case ESTADO.DISPONIBLE: return 'fd-seat fd-seat--disponible';
      case ESTADO.RESERVADO:  return 'fd-seat fd-seat--reservado';
      case ESTADO.OCUPADO:    return 'fd-seat fd-seat--ocupado';
      case ESTADO.BLOQUEADO:  return 'fd-seat fd-seat--bloqueado';
      default:                return 'fd-seat fd-seat--bloqueado';
    }
  };

  const getPillClass = (asiento) => {
    const id = norm(asiento, 'asientoVueloId', 'AsientoVueloId');
    if (asientoSeleccionado?.asientoVueloId === id) return 'fd-seat-pill fd-seat-pill--selected';
    const est = (norm(asiento, 'estado', 'Estado') ?? '').toUpperCase();
    return est === ESTADO.DISPONIBLE
      ? 'fd-seat-pill fd-seat-pill--disponible'
      : 'fd-seat-pill fd-seat-pill--disabled';
  };

  // Contar clase de disponibilidad
  const countClass = totalDisponibles === 0
    ? 'fd-seat-count--none'
    : totalDisponibles <= 5
      ? 'fd-seat-count--low'
      : '';

  return (
    <div className="fd-card">
      <div className="fd-card__header">
        <svg className="fd-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="10" width="5" height="8" rx="1"/>
          <rect x="10" y="10" width="5" height="8" rx="1"/>
          <rect x="17" y="10" width="4" height="8" rx="1"/>
          <path d="M3 10V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3"/>
        </svg>
        <h2 className="fd-card__title">Selección de asiento</h2>
        <span className={`fd-seat-count ${countClass}`} style={{ marginLeft: 'auto' }}>
          {totalDisponibles === 0
            ? 'Sin asientos disponibles'
            : totalDisponibles === 1
              ? '1 asiento disponible'
              : `${totalDisponibles} asientos disponibles`}
        </span>
      </div>
      <div className="fd-card__body">
        {/* Leyenda */}
        <div className="fd-seat-legend">
          <div className="fd-seat-legend__item">
            <div className="fd-legend-dot fd-legend-dot--disponible" />
            Disponible
          </div>
          <div className="fd-seat-legend__item">
            <div className="fd-legend-dot fd-legend-dot--selected" />
            Seleccionado
          </div>
          <div className="fd-seat-legend__item">
            <div className="fd-legend-dot fd-legend-dot--reservado" />
            Reservado
          </div>
          <div className="fd-seat-legend__item">
            <div className="fd-legend-dot fd-legend-dot--ocupado" />
            Ocupado
          </div>
          <div className="fd-seat-legend__item">
            <div className="fd-legend-dot fd-legend-dot--bloqueado" />
            Bloqueado
          </div>
        </div>

        {/* Sin asientos */}
        {asientos.length === 0 && (
          <div className="fd-no-seats">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#ccc" style={{ marginBottom: 12 }}>
              <path d="M3 10V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3"/>
              <rect x="3" y="10" width="5" height="8" rx="1"/>
              <rect x="10" y="10" width="5" height="8" rx="1"/>
            </svg>
            <p>No hay asientos disponibles para este vuelo.</p>
          </div>
        )}

        {/* Grid visual (cuando tenemos filas/columnas del avión) */}
        {usarGrid && asientos.length > 0 && (
          <GridView
            asientos={asientos}
            filasTotales={filasTotales}
            columnasTotales={columnasTotales}
            getSeatClass={getSeatClass}
            onSeatClick={handleClick}
            asientoSeleccionado={asientoSeleccionado}
          />
        )}

        {/* Lista de pills (fallback si no hay layout de avión) */}
        {!usarGrid && asientos.length > 0 && (
          <div className="fd-seat-list">
            {asientos.map((a, i) => {
              const id    = norm(a, 'asientoVueloId', 'AsientoVueloId') ?? i;
              const num   = norm(a, 'numeroAsiento',  'NumeroAsiento')  ?? '?';
              const clase = norm(a, 'clase',          'Clase')          ?? '';
              const tipo  = norm(a, 'tipoAsiento',    'TipoAsiento')    ?? '';
              const precio= norm(a, 'precioAdicional','PrecioAdicional');
              const est   = (norm(a, 'estado', 'Estado') ?? '').toUpperCase();
              const isDisabled = est !== ESTADO.DISPONIBLE;
              return (
                <button
                  key={id}
                  className={getPillClass(a)}
                  onClick={() => handleClick(a)}
                  disabled={isDisabled}
                  title={`${num} · ${clase} · ${est}`}
                >
                  <span>{num}</span>
                  {clase && <span className="fd-seat-pill__clase">{clase}</span>}
                  {precio != null && <span className="fd-seat-pill__precio">{formatPrecio(precio)}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Info del asiento seleccionado */}
        {asientoSeleccionado && (
          <div className="fd-seat-selected-info">
            <div className="fd-seat-selected-info__left">
              <div className="fd-seat-selected-info__num">
                Asiento {asientoSeleccionado.numeroAsiento}
              </div>
              <div className="fd-seat-selected-info__meta">
                {[asientoSeleccionado.clase, asientoSeleccionado.tipoAsiento]
                  .filter(Boolean).join(' · ')}
              </div>
            </div>
            <div className="fd-seat-selected-info__price">
              {formatPrecio(asientoSeleccionado.precioAdicional) ?? 'Sin costo'}
            </div>
            <button
              className="fd-seat-deselect"
              onClick={() => onSelect(null)}
              type="button"
            >
              Cambiar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Grid visual de cabina ────────────────────────────────────────────────────
const GridView = ({ asientos, filasTotales, columnasTotales, getSeatClass, onSeatClick, asientoSeleccionado }) => {
  // Construir mapa fila×col → asiento
  const mapa = {};
  asientos.forEach(a => {
    const fila = norm(a, 'fila', 'Fila');
    const col  = norm(a, 'columna', 'Columna');
    if (fila != null && col != null) {
      mapa[`${fila}-${col}`] = a;
    }
  });

  // Si no tenemos fila/columna en los datos, usar lista de pills
  const tieneLayout = Object.keys(mapa).length > 0;
  if (!tieneLayout) return null;

  // Letras de columna
  const colLetras = Array.from({ length: columnasTotales }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  // Separador de pasillo (aprox en col central)
  const aisleAfter = Math.floor(columnasTotales / 2) - 1;

  return (
    <div className="fd-seat-grid-wrapper">
      {/* Etiquetas de columna */}
      <div className="fd-seat-col-labels">
        {colLetras.map((letra, ci) => (
          <React.Fragment key={letra}>
            <div className="fd-seat-col-label">{letra}</div>
            {ci === aisleAfter && <div className="fd-seat-aisle" />}
          </React.Fragment>
        ))}
      </div>

      {/* Filas */}
      <div className="fd-seat-grid" style={{ gridTemplateRows: `repeat(${filasTotales}, auto)` }}>
        {Array.from({ length: filasTotales }, (_, ri) => {
          const filaNum = ri + 1;
          return (
            <div key={filaNum} className="fd-seat-row">
              <div className="fd-seat-row-num">{filaNum}</div>
              {colLetras.map((letra, ci) => {
                const asiento = mapa[`${filaNum}-${letra}`] ?? mapa[`${filaNum}-${ci + 1}`];
                return (
                  <React.Fragment key={`${filaNum}-${letra}`}>
                    {asiento ? (
                      <button
                        className={getSeatClass(asiento)}
                        onClick={() => onSeatClick(asiento)}
                        type="button"
                        title={`${norm(asiento, 'numeroAsiento', 'NumeroAsiento')} · ${norm(asiento, 'clase', 'Clase')} · ${norm(asiento, 'estado', 'Estado')}`}
                      >
                        {norm(asiento, 'columna', 'Columna') ?? letra}
                      </button>
                    ) : (
                      <div className="fd-seat fd-seat--bloqueado">—</div>
                    )}
                    {ci === aisleAfter && <div className="fd-seat-aisle" />}
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeatSelector;
