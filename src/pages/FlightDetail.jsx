// src/pages/FlightDetail.jsx
// Pantalla principal de detalle de vuelo.
// Flujo: Home → Results → FlightDetail → Payment → Confirmation
// Ruta: /flight/:vueloId
//
// Datos reales de API (todos con fallback graceful):
//   GET /api/v1/vuelo/{vueloId}
//   GET /api/v1/ruta/{rutaId}
//   GET /api/v1/aeropuerto/{id}  (origen, destino, escalas)
//   GET /api/v1/avion/{avionId}
//   GET /api/v1/escala/por-vuelo/{vueloId}
//   GET /api/v1/asientovuelo/por-vuelo/{vueloId}
//
// Sin datos inventados. Si algo falla → "No disponible" en esa sección.

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import FlightHeader   from '../components/flight/FlightHeader';
import ItineraryCard  from '../components/flight/ItineraryCard';
import FlightTimeline from '../components/flight/FlightTimeline';
import AircraftInfo   from '../components/flight/AircraftInfo';
import AmenitiesRow   from '../components/flight/AmenitiesRow';
import SeatSelector   from '../components/flight/SeatSelector';
import PriceSidebar   from '../components/flight/PriceSidebar';

import {
  getVueloPorId,
  getRutaPorId,
  getAeropuertoPorId,
  getAvionPorId,
  getEscalasPorVuelo,
  getAsientosPorVuelo,
} from '../services/flightDetail.service';

import '../styles/flightDetail.css';

// ── Utilidad de normalización (camelCase / PascalCase) ────────────────────────
const norm = (obj, ...keys) => {
  if (!obj) return null;
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
    const lc = k.charAt(0).toLowerCase() + k.slice(1);
    if (obj[lc] != null) return obj[lc];
  }
  return null;
};

// ── Componente ────────────────────────────────────────────────────────────────
const FlightDetail = () => {
  const { vueloId } = useParams();
  const navigate    = useNavigate();

  // ── Estado de datos ────────────────────────────────────────────────────────
  const [vuelo,    setVuelo]    = useState(null);
  const [ruta,     setRuta]     = useState(null);
  const [origen,   setOrigen]   = useState(null);
  const [destino,  setDestino]  = useState(null);
  const [avion,    setAvion]    = useState(null);
  const [escalas,  setEscalas]  = useState([]);
  const [asientos, setAsientos] = useState([]);
  const [aeropuertosEscalaMap, setAeropuertosEscalaMap] = useState({});

  // ── Estado de UI ───────────────────────────────────────────────────────────
  const [loadingPrincipal, setLoadingPrincipal] = useState(true);
  const [errorPrincipal,   setErrorPrincipal]   = useState(null); // null | 'not_found' | 'error'
  const [asientoSeleccionado, setAsientoSeleccionado] = useState(null);

  // ── Carga principal: vuelo + ruta + aeropuertos + avión ────────────────────
  useEffect(() => {
    if (!vueloId) return;

    const run = async () => {
      setLoadingPrincipal(true);
      setErrorPrincipal(null);

      try {
        // 1. Vuelo
        const vueloData = await getVueloPorId(vueloId);
        if (!vueloData) {
          setErrorPrincipal('not_found');
          setLoadingPrincipal(false);
          return;
        }
        setVuelo(vueloData);

        // 2. Ruta, Avión, Escalas, Asientos — en paralelo
        const rutaId  = norm(vueloData, 'rutaId',  'RutaId');
        const avionId = norm(vueloData, 'avionId', 'AvionId');

        const [rutaData, avionData, escalasData, asientosData] = await Promise.allSettled([
          rutaId  ? getRutaPorId(rutaId)          : Promise.resolve(null),
          avionId ? getAvionPorId(avionId)         : Promise.resolve(null),
          getEscalasPorVuelo(vueloId),
          getAsientosPorVuelo(vueloId),
        ]);

        const ruta_    = rutaData.status   === 'fulfilled' ? rutaData.value   : null;
        const avion_   = avionData.status  === 'fulfilled' ? avionData.value  : null;
        const escalas_ = escalasData.status === 'fulfilled' ? (escalasData.value ?? []) : [];
        const asientos_= asientosData.status=== 'fulfilled' ? (asientosData.value ?? []) : [];

        setRuta(ruta_);
        setAvion(avion_);
        setEscalas(escalas_);
        setAsientos(asientos_);

        // 3. Aeropuertos origen/destino desde la ruta
        if (ruta_) {
          const origenId  = norm(ruta_, 'aeropuertoOrigenId',  'AeropuertoOrigenId');
          const destinoId = norm(ruta_, 'aeropuertoDestinoId', 'AeropuertoDestinoId');

          const [origData, destData] = await Promise.allSettled([
            origenId  ? getAeropuertoPorId(origenId)  : Promise.resolve(null),
            destinoId ? getAeropuertoPorId(destinoId) : Promise.resolve(null),
          ]);

          setOrigen(origData.status  === 'fulfilled' ? origData.value  : null);
          setDestino(destData.status === 'fulfilled' ? destData.value  : null);
        }

        // 4. Aeropuertos de escalas
        if (escalas_.length > 0) {
          const escalaMapa = {};
          await Promise.allSettled(
            escalas_.map(async (esc) => {
              const aeroId = norm(esc, 'aeropuertoEscalaId', 'AeropuertoEscalaId');
              if (aeroId == null) return;
              try {
                const aeroData = await getAeropuertoPorId(aeroId);
                if (aeroData) escalaMapa[aeroId] = aeroData;
              } catch { /* sin aeropuerto de escala → sección mostrará "No disponible" */ }
            })
          );
          setAeropuertosEscalaMap(escalaMapa);
        }

      } catch (err) {
        console.error('[FlightDetail] Error crítico:', err);
        setErrorPrincipal('error');
      } finally {
        setLoadingPrincipal(false);
      }
    };

    run();
  }, [vueloId]);

  // ── Estado: Loading ────────────────────────────────────────────────────────
  if (loadingPrincipal) {
    return (
      <div className="fd-page">
        <div className="fd-loading">
          <div className="fd-spinner" />
          <span className="fd-loading__text">Cargando detalles del vuelo…</span>
        </div>
      </div>
    );
  }

  // ── Estado: Vuelo no encontrado ────────────────────────────────────────────
  if (errorPrincipal === 'not_found') {
    return (
      <div className="fd-page">
        <div className="fd-not-found">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="#B0BEC5">
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
          <h2>Vuelo no encontrado</h2>
          <p>No encontramos el vuelo con ID <strong>{vueloId}</strong>.</p>
          <Link to="/results" className="fd-error-state__btn">Volver a resultados</Link>
        </div>
      </div>
    );
  }

  // ── Estado: Error de API ───────────────────────────────────────────────────
  if (errorPrincipal === 'error') {
    return (
      <div className="fd-page">
        <div className="fd-error-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="#FFCDD2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h2>No pudimos cargar el vuelo</h2>
          <p>No pudimos cargar el detalle del vuelo. Verifica tu conexión e intenta nuevamente.</p>
          <button className="fd-error-state__btn" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ── Render principal ───────────────────────────────────────────────────────
  return (
    <div className="fd-page">
      {/* Breadcrumb */}
      <nav className="fd-breadcrumb" aria-label="Navegación">
        <Link to="/">Inicio</Link>
        <span className="fd-breadcrumb__sep">›</span>
        <Link to="/results">Resultados</Link>
        <span className="fd-breadcrumb__sep">›</span>
        <span>Detalle del vuelo</span>
      </nav>

      {/* Cabecera de contexto */}
      <FlightHeader vuelo={vuelo} origen={origen} destino={destino} />

      {/* Contenido en dos columnas */}
      <div className="fd-container">

        {/* ── Columna izquierda: detalle ── */}
        <main className="fd-main">

          {/* 1. Tarjeta de itinerario */}
          <ItineraryCard
            vuelo={vuelo}
            avion={avion}
            origen={origen}
            destino={destino}
          />

          {/* 2. Timeline con escalas */}
          <FlightTimeline
            vuelo={vuelo}
            escalas={escalas}
            aeropuertosEscalaMap={aeropuertosEscalaMap}
            origen={origen}
            destino={destino}
          />

          {/* 3. Información del avión */}
          {avion ? (
            <AircraftInfo avion={avion} />
          ) : (
            <div className="fd-card">
              <div className="fd-card__header">
                <h2 className="fd-card__title">Información de la aeronave</h2>
              </div>
              <div className="fd-card__body">
                <p className="fd-na">Información de aeronave no disponible.</p>
              </div>
            </div>
          )}


          {/* 5. Servicios a bordo */}
          <AmenitiesRow />

          {/* 6. Selección de asiento */}
          <SeatSelector
            asientos={asientos}
            avion={avion}
            asientoSeleccionado={asientoSeleccionado}
            onSelect={setAsientoSeleccionado}
          />

        </main>

        {/* ── Columna derecha: sidebar sticky de precio ── */}
        <aside>
          <PriceSidebar
            vuelo={vuelo}
            ruta={ruta}
            origen={origen}
            destino={destino}
            avion={avion}
            asientoSeleccionado={asientoSeleccionado}
          />
        </aside>

      </div>
    </div>
  );
};

export default FlightDetail;
