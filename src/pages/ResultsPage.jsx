import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { getVuelos } from '../services/vueloService';
import ResultsHeader from '../components/results/ResultsHeader';
import FilterSidebar from '../components/results/FilterSidebar';
import FlightCard from '../components/results/FlightCard';
import EmptyResults from '../components/results/EmptyResults';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setVueloSeleccionado } = useBooking();
  const state = location.state || {};

  const [resultados, setResultados] = useState(Array.isArray(state.resultados) ? state.resultados : []);
  const [loading, setLoading] = useState(!Array.isArray(state.resultados) || state.resultados.length === 0);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState({
    aerolinea: 'Todas',
    estado: 'Todos',
    horario: 'Todos',
    escalas: 'Todos',
  });

  const origen = state.origen || null;
  const destino = state.destino || null;
  const fecha = state.fecha || '';
  const pasajeros = state.pasajeros || { adults: 1, children: 0, infants: 0, clase: 'Económica' };
  const clase = state.clase || pasajeros.clase;

  useEffect(() => {
    const shouldFetchFallback = !Array.isArray(state.resultados) || state.resultados.length === 0;
    if (!shouldFetchFallback) return;

    const fetchFallback = async () => {
      setLoading(true);
      setError(false);

      try {
        const data = await getVuelos();
        setResultados(data || []);
      } catch (e) {
        console.error('Error cargando vuelos de fallback:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFallback();
  }, [state.resultados]);

  const aerolineas = useMemo(
    () => [...new Set(resultados.map((v) => v.aerolineaOperadora).filter(Boolean))],
    [resultados]
  );

  const estados = useMemo(
    () => [...new Set(resultados.map((v) => v.estado).filter(Boolean))],
    [resultados]
  );

  const filteredResults = useMemo(() => {
    let flights = resultados;

    if (filters.aerolinea !== 'Todas') {
      flights = flights.filter((v) => v.aerolineaOperadora === filters.aerolinea);
    }

    if (filters.estado !== 'Todos') {
      flights = flights.filter((v) => v.estado === filters.estado);
    }

    if (filters.horario !== 'Todos') {
      flights = flights.filter((v) => {
        const fechaSalida = new Date(v.fechaSalida);
        if (Number.isNaN(fechaSalida.getTime())) return false;
        const hora = fechaSalida.getHours();
        if (filters.horario === 'Mañana') return hora >= 5 && hora < 12;
        if (filters.horario === 'Tarde') return hora >= 12 && hora < 18;
        return hora >= 18 || hora < 5;
      });
    }

    if (filters.escalas !== 'Todos') {
      flights = flights.filter((v) => {
        const observaciones = String(v.observaciones || '').toLowerCase();
        const tieneEscala = /escala|parada|stop|conexión/.test(observaciones);
        return filters.escalas === 'Directo' ? !tieneEscala : tieneEscala;
      });
    }

    return flights;
  }, [resultados, filters]);

  const handleSelect = (vuelo) => {
    setVueloSeleccionado(vuelo);
    navigate(`/vuelo/${vuelo.vueloId}`, { state: { vuelo } });
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <ResultsHeader
          origen={origen?.nombreCiudad || origen?.codigoIATA || origen}
          destino={destino?.nombreCiudad || destino?.codigoIATA || destino}
          fecha={fecha}
          pasajeros={pasajeros}
          clase={clase}
          total={filteredResults.length}
          loading={loading}
        />

        <div style={styles.layout}>
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            aerolineas={aerolineas}
            estados={estados}
          />

          <main style={styles.main}>
            {loading ? (
              <div style={styles.loading}>Cargando vuelos...</div>
            ) : error ? (
              <EmptyResults message="No se pudieron cargar resultados. Intenta nuevamente más tarde." />
            ) : filteredResults.length === 0 ? (
              <EmptyResults message="No hay vuelos disponibles con esos filtros." />
            ) : (
              filteredResults.map((vuelo) => (
                <FlightCard key={vuelo.vueloId} vuelo={vuelo} onSelect={() => handleSelect(vuelo)} />
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F5F7FB',
    padding: '24px 0 40px',
    fontFamily: "BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    color: '#1A1A1A',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '280px minmax(0, 1fr)',
    gap: '24px',
    marginTop: '28px',
  },
  main: {
    display: 'grid',
    gap: '18px',
  },
  loading: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 18px 46px rgba(0,53,128,0.08)',
    textAlign: 'center',
    color: '#003580',
    fontWeight: 700,
  },
};

export default ResultsPage;
