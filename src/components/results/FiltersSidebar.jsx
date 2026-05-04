// src/components/results/FiltersSidebar.jsx
// Filtros 100% basados en datos reales de la API.
// Reglas:
//   - Sin "Filtros inteligentes" (IA widget eliminado).
//   - Sin equipaje (no existe ReservaPasajeroId en Results).
//   - Aerolíneas: extraídas de AerolineaOperadora de los vuelos reales.
//   - Aeropuertos: traducidos con el mapa de aeropuertos cargado desde la API.
//   - Estado: sale de Vuelo.Estado real. Si no hay, la sección se oculta.
//   - Escalas: contadores reales usando escalasMap.
//   - Horarios: basados en FechaSalida y FechaLlegadaEstimada.
//   - Duración: en horas, usando maxDuracionH calculado en Results.jsx.
//   - Precio: slider sobre PrecioBase real; si no viene, no se muestra sección.

import { useState, useEffect, useMemo } from 'react';

// ── Subcomponente plegable ────────────────────────────────────────────────────
const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-section">
      <button
        type="button"
        className="filter-section__header"
        onClick={() => setOpen(o => !o)}
      >
        <span className="filter-section__label">{title}</span>
        <span className={`filter-section__chevron ${open ? 'open' : ''}`}>▼</span>
      </button>
      {open && <div className="filter-section__body">{children}</div>}
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const norm = (obj, ...keys) => {
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
    const lc = k.charAt(0).toLowerCase() + k.slice(1);
    if (obj[lc] != null) return obj[lc];
  }
  return null;
};

const getHora = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d) ? null : d.getHours();
};

const formatHoras = (h) => {
  if (h < 1) return 'menos de 1h';
  return `${h}h`;
};

// ── Componente principal ──────────────────────────────────────────────────────
const FiltersSidebar = ({
  vuelos = [],
  escalasMap = {},
  aeropuertos = {},  // { aeropuertoId: { codigoIATA, nombre } }
  maxDuracionH = 48,
  filters,
  onFiltersChange,
}) => {

  // ── Datos derivados de los vuelos reales ─────────────────────────────────
  const aerolineasUnicas = useMemo(() =>
    [...new Set(vuelos.map(v => norm(v, 'aerolineaOperadora', 'AerolineaOperadora')).filter(Boolean))].sort()
  , [vuelos]);

  // Contadores de escalas reales
  const stopCounts = useMemo(() => {
    const counts = { 0: 0, 1: 0, 2: 0 };
    vuelos.forEach(v => {
      const id  = norm(v, 'vueloId', 'VueloId');
      const n   = (escalasMap[id] ?? []).length;
      const key = n === 0 ? 0 : n === 1 ? 1 : 2;
      counts[key]++;
    });
    return counts;
  }, [vuelos, escalasMap]);

  // Aeropuertos únicos — traducidos desde el mapa de aeropuertos
  // Primero intenta IATA que ya viene en el vuelo (ruta/buscar),
  // luego usa AeropuertoOrigenId/DestinoId traducido.
  const aeropuertosUnicos = useMemo(() => {
    const set = new Set();
    vuelos.forEach(v => {
      const orig = norm(v, 'origen', 'Origen');
      const dest = norm(v, 'destino', 'Destino');
      if (orig) set.add(orig);
      if (dest) set.add(dest);
    });
    // Enriquecer con nombre si disponible
    return [...set].sort().map(iata => {
      // Buscar en el mapa de aeropuertos por IATA
      const entry = Object.values(aeropuertos).find(a => a.codigoIATA === iata);
      return { iata, nombre: entry?.nombre ?? iata };
    });
  }, [vuelos, aeropuertos]);

  // Estados únicos
  const estadosUnicos = useMemo(() =>
    [...new Set(vuelos.map(v => norm(v, 'estado', 'Estado')).filter(Boolean))].sort()
  , [vuelos]);

  // Rango de precios reales (PrecioBase)
  const precioRange = useMemo(() => {
    const precios = vuelos
      .map(v => norm(v, 'precioBase', 'PrecioBase'))
      .filter(p => p != null && p > 0);
    if (!precios.length) return null;
    return { min: Math.min(...precios), max: Math.max(...precios) };
  }, [vuelos]);

  // Precio máximo seleccionado (estado local sincronizado con precioRange)
  const [maxPrecio, setMaxPrecio] = useState(null);
  useEffect(() => {
    if (precioRange) setMaxPrecio(precioRange.max);
  }, [precioRange]);

  // ── Helpers para cambiar filtros ─────────────────────────────────────────
  const toggle = (key, val) => {
    const current = filters[key] ?? [];
    const next = current.includes(val)
      ? current.filter(x => x !== val)
      : [...current, val];
    onFiltersChange({ [key]: next });
  };

  const reset = () => {
    onFiltersChange({
      depHour:  23,
      arrHour:  23,
      maxDurH:  maxDuracionH,
      airlines: [],
      airports: [],
      estados:  [],
    });
    if (precioRange) setMaxPrecio(precioRange.max);
  };

  const stopLabels = [
    { val: 0, label: 'Directo' },
    { val: 1, label: '1 escala' },
    { val: 2, label: '2+ escalas' },
  ];

  return (
    <aside className="filters-sidebar">
      <div className="filters-sidebar__title">
        Filtros
        <button type="button" className="filters-sidebar__reset" onClick={reset}>
          Restablecer
        </button>
      </div>


      {/* ── Hora de salida ─────────────────────────────────────────────────── */}
      <Section title="Hora de salida" defaultOpen={false}>
        <div className="filter-slider-wrap">
          <div className="filter-slider-label">
            <span>00:00</span>
            <span>hasta {String(filters.depHour ?? 23).padStart(2, '0')}:59</span>
          </div>
          <input
            type="range" min={0} max={23} step={1}
            value={filters.depHour ?? 23}
            onChange={e => onFiltersChange({ depHour: +e.target.value })}
            className="filter-slider"
          />
        </div>
      </Section>

      {/* ── Hora de llegada ────────────────────────────────────────────────── */}
      <Section title="Hora de llegada" defaultOpen={false}>
        <div className="filter-slider-wrap">
          <div className="filter-slider-label">
            <span>00:00</span>
            <span>hasta {String(filters.arrHour ?? 23).padStart(2, '0')}:59</span>
          </div>
          <input
            type="range" min={0} max={23} step={1}
            value={filters.arrHour ?? 23}
            onChange={e => onFiltersChange({ arrHour: +e.target.value })}
            className="filter-slider"
          />
        </div>
      </Section>

      {/* ── Duración máxima ────────────────────────────────────────────────── */}
      <Section title="Duración máxima" defaultOpen={false}>
        <div className="filter-slider-wrap">
          <div className="filter-slider-label">
            <span>1h</span>
            <span>{formatHoras(filters.maxDurH ?? maxDuracionH)}</span>
          </div>
          <input
            type="range" min={1} max={maxDuracionH || 48} step={1}
            value={filters.maxDurH ?? maxDuracionH}
            onChange={e => onFiltersChange({ maxDurH: +e.target.value })}
            className="filter-slider"
          />
        </div>
      </Section>

      {/* ── Precio base (solo si la API devuelve PrecioBase) ──────────────── */}
      {precioRange && maxPrecio != null && (
        <Section title="Precio base" defaultOpen={false}>
          <div className="filter-slider-wrap">
            <div className="filter-slider-label">
              <span>${precioRange.min.toFixed(0)}</span>
              <span>hasta ${maxPrecio.toFixed(0)}</span>
            </div>
            <input
              type="range"
              min={precioRange.min}
              max={precioRange.max}
              step={1}
              value={maxPrecio}
              onChange={e => {
                const val = +e.target.value;
                setMaxPrecio(val);
                // Propagar filtro al padre — filtrado externo en Results.jsx
                // usando el mismo mecanismo que los demás
                onFiltersChange({ maxPrecio: val });
              }}
              className="filter-slider"
            />
          </div>
        </Section>
      )}

      {/* ── Aerolíneas ─────────────────────────────────────────────────────── */}
      <Section title="Aerolíneas" defaultOpen={false}>
        {aerolineasUnicas.length === 0 ? (
          vuelos.length === 0
            ? <p style={{ fontSize: 12, color: '#999' }}>Sin resultados</p>
            : <p style={{ fontSize: 12, color: '#999' }}>Cargando…</p>
        ) : (
          aerolineasUnicas.map(a => (
            <label key={a} className="filter-check">
              <input
                type="checkbox"
                checked={(filters.airlines ?? []).includes(a)}
                onChange={() => toggle('airlines', a)}
              />
              {a}
            </label>
          ))
        )}
      </Section>

      {/* ── Aeropuertos ────────────────────────────────────────────────────── */}
      {aeropuertosUnicos.length > 0 && (
        <Section title="Aeropuertos" defaultOpen={false}>
          {aeropuertosUnicos.map(({ iata, nombre }) => (
            <label key={iata} className="filter-check">
              <input
                type="checkbox"
                checked={(filters.airports ?? []).includes(iata)}
                onChange={() => toggle('airports', iata)}
              />
              <span className="filter-airport">
                <strong>{iata}</strong>
                {nombre !== iata && ` · ${nombre}`}
              </span>
            </label>
          ))}
        </Section>
      )}

      {/* ── Estado del vuelo ───────────────────────────────────────────────── */}
      {estadosUnicos.length > 0 && (
        <Section title="Estado del vuelo" defaultOpen={false}>
          {estadosUnicos.map(e => (
            <label key={e} className="filter-check">
              <input
                type="checkbox"
                checked={(filters.estados ?? []).includes(e)}
                onChange={() => toggle('estados', e)}
              />
              {e}
            </label>
          ))}
        </Section>
      )}

    </aside>
  );
};

export default FiltersSidebar;