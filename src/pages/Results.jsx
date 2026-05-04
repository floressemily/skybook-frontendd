// src/pages/Results.jsx
// Orquestador de la pantalla de resultados de vuelos.
//
// Fuentes de datos (todos desde la API real):
//   1. /api/v1/ruta/buscar?origen=UIO&destino=GYE&fecha=YYYY-MM-DD
//   2. Fallback optimizado:
//      a. /api/v1/aeropuerto/por-codigo/{IATA} -> AeropuertoId
//      b. /api/v1/ruta -> encontrar rutaId por origenId y destinoId
//      c. /api/v1/vuelo/por-ruta/{rutaId} -> filtrar por fecha
//   3. Fallback final (desarrollo): /api/v1/vuelo -> filtrar en frontend
//
// Otros datos:
//   /api/v1/escala/por-vuelo/{vueloId}
//   /api/v1/asientovuelo/por-vuelo/{vueloId}

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import SearchEditBar from '../components/results/SearchEditBar';
import FiltersSidebar from '../components/results/FiltersSidebar';
import FlightResultsList from '../components/results/FlightResultsList';
import LegalNotes from '../components/results/LegalNotes';

import { buscarRutas, getRutas } from '../services/ruta.service';
import { getVuelos, getVuelosPorRuta } from '../services/vuelo.service';
import { getEscalasPorVuelo } from '../services/escala.service';
import { getAeropuertos, getAeropuertoPorCodigo } from '../services/aeropuertoService';
import { getAsientosPorVuelo, contarDisponibles } from '../services/asiento.service';
import { mockVuelos, mockRutaBuscar, mockEscalas } from '../mock/mockData';

import '../styles/results.css';

// ── Utilidades ──────────────────────────────────────────────────────────────
const calcDurMs = (v) => {
  const s = new Date(v.fechaSalida ?? v.FechaSalida);
  const l = new Date(v.fechaLlegadaEstimada ?? v.FechaLlegadaEstimada);
  return (!isNaN(s) && !isNaN(l)) ? l - s : Infinity;
};

const buildAeropuertoMap = (lista = []) => {
  const map = {};
  lista.forEach(a => {
    map[a.aeropuertoId] = {
      codigoIATA: a.codigoIATA ?? a.CodigoIATA ?? '',
      nombre: a.nombre ?? a.Nombre ?? '',
    };
  });
  return map;
};

const norm = (obj, ...keys) => {
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
    const lc = k.charAt(0).toLowerCase() + k.slice(1);
    if (obj[lc] != null) return obj[lc];
  }
  return null;
};

// ── Componente ───────────────────────────────────────────────────────────────
const Results = () => {
  const location = useLocation();
  const stateParams = location.state?.params || {};
  const stateData = location.state?.resultados || null;

  // ── Estado principal ──────────────────────────────────────────────────────
  const [vuelos, setVuelos] = useState([]);
  const [escalasMap, setEscalasMap] = useState({});
  const [asientosMap, setAsientosMap] = useState({});
  const [aeropuertos, setAeropuertos] = useState({});
  const [rutasMap, setRutasMap] = useState({});   // { rutaId → RutaResponse }
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [searchParams, setSearchParams] = useState(stateParams);

  // ── Filtros ───────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    depHour: 23,
    arrHour: 23,
    maxDurH: 48,
    airlines: [],
    airports: [],
    estados: [],
    maxPrecio: null,
  });

  useEffect(() => {
    getAeropuertos()
      .then(lista => setAeropuertos(buildAeropuertoMap(lista)))
      .catch(() => { });
  }, []);

  // Cargar mapa de rutas una sola vez (rutaId → ruta con distanciaKm, duracionMin, precioBase)
  useEffect(() => {
    getRutas()
      .then(lista => {
        const map = {};
        (lista ?? []).forEach(r => {
          const id = r.rutaId ?? r.RutaId;
          if (id != null) map[id] = r;
        });
        setRutasMap(map);
        console.log('[Results] rutasMap cargado:', map);
      })
      .catch(err => console.warn('[Results] No se pudo cargar rutas:', err.message));
  }, []);

  // ── Fetch principal de vuelos ─────────────────────────────────────────────
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setApiError(false);
      setUsedFallback(false);

      let data = [];
      let step1Ok = false;
      let step2Ok = false;

      try {
        if (stateData && Array.isArray(stateData) && stateData.length > 0) {
          data = stateData;
        } else if (searchParams.origen && searchParams.destino) {
          
          // ── PASO 1: /ruta/buscar ──────────────────────────────────────────
          try {
            const res = await buscarRutas({
              origen: searchParams.origen,
              destino: searchParams.destino,
              ...(searchParams.fecha ? { fecha: searchParams.fecha } : {}),
            });
            data = res ?? [];
            step1Ok = true;
          } catch (e) {
            console.warn('[Results] Paso 1 falló:', e.message);
          }

          // ── PASO 2: Fallback optimizado (Por RutaId) ─────────────────────
          if (data.length === 0) {
            console.info('[Results] Intentando Paso 2 (Búsqueda por RutaId)...');
            try {
              const [origAero, destAero] = await Promise.all([
                getAeropuertoPorCodigo(searchParams.origen),
                getAeropuertoPorCodigo(searchParams.destino)
              ]);

              if (origAero && destAero) {
                const todasRutas = await getRutas();
                const ruta = todasRutas.find(r => 
                  norm(r, 'aeropuertoOrigenId', 'AeropuertoOrigenId') === norm(origAero, 'aeropuertoId', 'AeropuertoId') &&
                  norm(r, 'aeropuertoDestinoId', 'AeropuertoDestinoId') === norm(destAero, 'aeropuertoId', 'AeropuertoId')
                );

                if (ruta) {
                  const rId = norm(ruta, 'rutaId', 'RutaId');
                  const vuelosRuta = await getVuelosPorRuta(rId);
                  data = (vuelosRuta ?? []).filter(v => {
                    const f = norm(v, 'fechaSalida', 'FechaSalida') ?? '';
                    return !searchParams.fecha || f.startsWith(searchParams.fecha);
                  });
                  step2Ok = true;
                  if (data.length > 0) setUsedFallback(true);
                }
              }
            } catch (e) {
              console.warn('[Results] Paso 2 falló:', e.message);
            }
          }

          // ── PASO 3: Fallback pesado (GET /vuelo total) ───────────────────
          if (data.length === 0) {
            console.info('[Results] Intentando Paso 3 (GET /vuelo total)...');
            try {
              const todos = await getVuelos();
              data = (todos ?? []).filter(v => {
                const o = norm(v, 'codigoIATAOrigen', 'CodigoIATAOrigen') ?? '';
                const d = norm(v, 'codigoIATADestino', 'CodigoIATADestino') ?? '';
                const f = norm(v, 'fechaSalida', 'FechaSalida') ?? '';
                return o.toUpperCase() === searchParams.origen.toUpperCase() &&
                       d.toUpperCase() === searchParams.destino.toUpperCase() &&
                       (!searchParams.fecha || f.startsWith(searchParams.fecha));
              });
              if (data.length > 0) setUsedFallback(true);
            } catch (e) {
              console.warn('[Results] Paso 3 falló:', e.message);
              // Si ningún paso real funcionó y este dio error, lanzamos
              if (!step1Ok && !step2Ok) throw e;
            }
          }

        } else {
          data = await getVuelos();
        }
      } catch (err) {
        console.error('[Results] Error crítico de conexión:', err.message);
        if (data.length === 0) {
          setApiError(true);
          data = searchParams.origen ? mockRutaBuscar : mockVuelos;
        }
      }

      setVuelos(data);
      await Promise.all([loadEscalas(data), loadAsientos(data)]);
      setLoading(false);
    };

    run();
  }, [searchParams.origen, searchParams.destino, searchParams.fecha]);

  const loadEscalas = useCallback(async (lista) => {
    const mapa = {};
    await Promise.allSettled(
      lista.map(async (v) => {
        const id = norm(v, 'vueloId', 'VueloId');
        if (!id) return;
        try {
          const esc = await getEscalasPorVuelo(id);
          mapa[id] = Array.isArray(esc) ? esc : [];
        } catch {
          mapa[id] = mockEscalas[id] ?? [];
        }
      })
    );
    setEscalasMap(mapa);
  }, []);

  const loadAsientos = useCallback(async (lista) => {
    const mapa = {};
    await Promise.allSettled(
      lista.map(async (v) => {
        const id = norm(v, 'vueloId', 'VueloId');
        if (!id) return;
        const yaDisp = norm(v, 'asientosDisponibles', 'AsientosDisponibles');
        if (yaDisp != null) {
          mapa[id] = yaDisp;
          return;
        }
        try {
          const asientos = await getAsientosPorVuelo(id);
          mapa[id] = contarDisponibles(asientos);
        } catch {
          mapa[id] = null;
        }
      })
    );
    setAsientosMap(mapa);
  }, []);

  const vuelosFiltrados = useMemo(() => {
    return vuelos.filter(v => {
      const id = norm(v, 'vueloId', 'VueloId');
      const salida = new Date(norm(v, 'fechaSalida', 'FechaSalida'));
      if (!isNaN(salida) && salida.getHours() > filters.depHour) return false;
      const llegada = new Date(norm(v, 'fechaLlegadaEstimada', 'FechaLlegadaEstimada'));
      if (!isNaN(llegada) && llegada.getHours() > filters.arrHour) return false;
      const durMs = calcDurMs(v);
      if (durMs !== Infinity && durMs > filters.maxDurH * 3600000) return false;
      const aero = norm(v, 'aerolineaOperadora', 'AerolineaOperadora') ?? '';
      if (filters.airlines.length > 0 && !filters.airlines.includes(aero)) return false;
      if (filters.airports.length > 0) {
        const orig = norm(v, 'origen', 'Origen') ?? '';
        const dest = norm(v, 'destino', 'Destino') ?? '';
        if (!filters.airports.includes(orig) && !filters.airports.includes(dest)) return false;
      }
      const estado = norm(v, 'estado', 'Estado') ?? '';
      if (filters.estados.length > 0 && !filters.estados.includes(estado)) return false;
      if (filters.maxPrecio != null) {
        const precio = norm(v, 'precioBase', 'PrecioBase');
        if (precio != null && precio > filters.maxPrecio) return false;
      }
      return true;
    });
  }, [vuelos, filters, escalasMap]);

  const vuelosOrdenados = useMemo(() => {
    return [...vuelosFiltrados];
  }, [vuelosFiltrados]);

  const maxDuracionReal = useMemo(() => {
    if (!vuelos.length) return 48;
    const durs = vuelos.map(v => calcDurMs(v)).filter(d => d !== Infinity);
    if (!durs.length) return 48;
    return Math.ceil(Math.max(...durs) / 3600000);
  }, [vuelos]);

  const handleSearch = (p) => setSearchParams(p);
  const handleFilters = (f) => setFilters(prev => ({ ...prev, ...f }));

  const noResultsMsg = !loading && !apiError && vuelosOrdenados.length === 0 && (searchParams.origen || searchParams.destino)
    ? 'No encontramos vuelos para esta ruta en la fecha seleccionada. Intenta cambiar la fecha o la ruta.'
    : null;

  return (
    <div className="results-page">
      <SearchEditBar params={searchParams} onSearch={handleSearch} />
      <div className="results-content">
        <FiltersSidebar
          vuelos={vuelos}
          escalasMap={escalasMap}
          aeropuertos={aeropuertos}
          maxDuracionH={maxDuracionReal}
          filters={filters}
          onFiltersChange={handleFilters}
        />
        <main className="results-main">
          {!loading && (
            <div className="results-header">
              <p className="results-count">
                <strong>{vuelosOrdenados.length} vuelo{vuelosOrdenados.length !== 1 ? 's' : ''}</strong>
                {searchParams.origen && searchParams.destino ? ` · ${searchParams.origen} → ${searchParams.destino}` : ' encontrados'}
              </p>
              {apiError && (
                <p className="results-demo-notice">⚠️ No pudimos conectar con la API. Mostrando datos de demostración.</p>
              )}
            </div>
          )}
          {noResultsMsg && <p className="results-empty-notice">{noResultsMsg}</p>}
          <FlightResultsList
            vuelos={vuelosOrdenados}
            escalasMap={escalasMap}
            asientosMap={asientosMap}
            aeropuertos={aeropuertos}
            rutasMap={rutasMap}
            loading={loading}
            error={apiError && !vuelos.length}
          />
          {!loading && <LegalNotes />}
        </main>
      </div>
    </div>
  );
};

export default Results;