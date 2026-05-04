// src/components/home/SearchBox.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AirportInput from './AirportInput';
import DatePicker from './DatePicker';
import PassengerSelector from './PassengerSelector';
import { getAeropuertos } from '../../services/aeropuertoService';
import { buscarRutas } from '../../services/ruta.service';

const TRIP_TYPES = ['Solo ida', 'Ida y vuelta'];

const SearchBox = () => {
  const navigate = useNavigate();

  const [aeropuertos, setAeropuertos] = useState([]);
  const [loadingAeropuertos, setLoadingAeropuertos] = useState(false);
  const [errorAeropuertos, setErrorAeropuertos] = useState('');

  const [tripType, setTripType] = useState('Solo ida');
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [fechas, setFechas] = useState({ fechaIda: null, fechaVuelta: null });
  const [pasajeros, setPasajeros] = useState({ adults: 1, children: 0, infants: 0, clase: 'Económica' });

  const [errors, setErrors] = useState({});
  const [searching, setSearching] = useState(false);

  // Cargar aeropuertos reales desde la API
  useEffect(() => {
    const fetchAeropuertos = async () => {
      try {
        setLoadingAeropuertos(true);
        setErrorAeropuertos('');

        const data = await getAeropuertos();

        console.log('Aeropuertos cargados en Home:', data);

        setAeropuertos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error cargando aeropuertos:', error);
        setErrorAeropuertos('No se pudieron cargar los aeropuertos. Verifica que la API esté ejecutándose.');
        setAeropuertos([]);
      } finally {
        setLoadingAeropuertos(false);
      }
    };

    fetchAeropuertos();
  }, []);

  const intercambiar = () => {
    setOrigen(destino);
    setDestino(origen);
  };

  const validate = () => {
    const err = {};
    if (!origen) err.origen = 'Selecciona un aeropuerto de origen';
    if (!destino) err.destino = 'Selecciona un aeropuerto de destino';
    if (origen && destino && origen.aeropuertoId === destino.aeropuertoId) {
      err.destino = 'El destino debe ser diferente al origen';
    }
    if (!fechas.fechaIda) err.fechaIda = 'Selecciona fecha de ida';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSearch = async () => {
    if (!validate()) return;
    setSearching(true);

    const fechaSeleccionada = fechas.fechaIda ? fechas.fechaIda.toISOString().split('T')[0] : '';
    const params = {
      origen: origen.codigoIATA,
      destino: destino.codigoIATA,
      fecha: fechaSeleccionada || null,
    };

    try {
      const resultados = await buscarRutas(params);
      navigate('/results', {
        state: {
          resultados,
          params: {
            origen: origen.codigoIATA,
            destino: destino.codigoIATA,
            fecha: fechaSeleccionada,
          },
          origen: origen,
          destino: destino,
          pasajeros,
          clase: pasajeros.clase,
        },
      });
    } catch (e) {
      console.error('Error buscando rutas:', e);
      navigate('/results', {
        state: {
          params: {
            origen: origen.codigoIATA,
            destino: destino.codigoIATA,
            fecha: fechaSeleccionada,
          },
          origen: origen,
          destino: destino,
          pasajeros,
          clase: pasajeros.clase,
          error: true,
        },
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={styles.wrapper}>

      {/* Fila superior: tipo viaje + pasajeros */}
      <div style={styles.topBar}>
        <div style={styles.tripTypes}>
          {TRIP_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTripType(t)}
              style={{
                ...styles.tripBtn,
                ...(tripType === t ? styles.tripBtnActive : {}),
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <PassengerSelector value={pasajeros} onChange={setPasajeros} />
      </div>

      {/* Fila principal de búsqueda */}
      <div style={styles.mainRow}>

        {/* ORIGEN */}
        <div style={styles.fieldGroup}>
          <AirportInput
            label="Desde"
            placeholder={loadingAeropuertos ? 'Cargando...' : 'Ciudad o aeropuerto'}
            value={origen}
            onChange={setOrigen}
            aeropuertos={aeropuertos}
          />
          {errors.origen && <span style={styles.errTxt}>{errors.origen}</span>}
        </div>

        {/* Botón intercambio */}
        <button
          type="button"
          onClick={intercambiar}
          style={styles.swapBtn}
          title="Intercambiar origen y destino"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4"/>
          </svg>
        </button>

        {/* DESTINO */}
        <div style={styles.fieldGroup}>
          <AirportInput
            label="Hacia"
            placeholder="Ciudad o aeropuerto"
            value={destino}
            onChange={setDestino}
            aeropuertos={aeropuertos}
          />
          {errors.destino && <span style={styles.errTxt}>{errors.destino}</span>}
        </div>

        {/* Separador */}
        <div style={styles.separator} />

        {/* FECHAS */}
        <div style={styles.fieldGroup}>
          <DatePicker
            fechaIda={fechas.fechaIda}
            fechaVuelta={fechas.fechaVuelta}
            onChange={setFechas}
          />
          {errors.fechaIda && <span style={styles.errTxt}>{errors.fechaIda}</span>}
        </div>

        {/* Separador */}
        <div style={styles.separator} />

        {/* BOTÓN BUSCAR */}
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || loadingAeropuertos}
          style={{
            ...styles.searchBtn,
            ...(searching || loadingAeropuertos ? styles.searchBtnDisabled : {}),
          }}
        >
          {searching ? (
            <>
              <span style={styles.spinner} />
              Buscando...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Buscar
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 8px 40px rgba(0,53,128,0.15)',
    padding: '24px 28px 20px',
    border: '1px solid rgba(0,108,228,0.1)',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '24px',
  },
  tripTypes: {
    display: 'flex',
    gap: '4px',
    background: '#F5F5F5',
    borderRadius: '8px',
    padding: '3px',
  },
  tripBtn: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    background: 'transparent',
    color: '#4C4C4C',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  tripBtnActive: {
    background: '#fff',
    color: '#003580',
    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
  },
  mainRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    flexWrap: 'wrap',
  },
  fieldGroup: {
    flex: 1,
    minWidth: '160px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  separator: {
    width: '1px',
    height: '40px',
    backgroundColor: '#E7E7E7',
    flexShrink: 0,
    alignSelf: 'flex-end',
    marginBottom: '6px',
  },
  swapBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '2px solid #006CE4',
    background: '#fff',
    color: '#006CE4',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    alignSelf: 'flex-end',
    marginBottom: '6px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,108,228,0.2)',
  },
  searchBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 28px',
    backgroundColor: '#006CE4',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '16px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
    transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(0,108,228,0.35)',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
  searchBtnDisabled: {
    backgroundColor: '#7EB8F5',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  errTxt: {
    fontSize: '12px',
    color: '#D32F2F',
    marginTop: '2px',
  },
};

export default SearchBox;