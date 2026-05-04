// src/components/home/AirportInput.jsx
import { useState, useEffect, useRef } from 'react';

const AirportInput = ({ label, placeholder, value, onChange, aeropuertos = [] }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const ref = useRef(null);

  // Si ya hay un valor seleccionado, mostrar su display
  const displayQuery = value ? `${value.nombre} (${value.codigoIATA})` : query;

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    onChange(null); // limpiar selección
    if (q.length >= 1) {
      const f = aeropuertos.filter(a =>
        a.nombre?.toLowerCase().includes(q.toLowerCase()) ||
        a.codigoIATA?.toLowerCase().includes(q.toLowerCase()) ||
        a.nombreCiudad?.toLowerCase().includes(q.toLowerCase())
      );
      setFiltered(f.slice(0, 8));
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleSelect = (aeropuerto) => {
    onChange(aeropuerto);
    setQuery(`${aeropuerto.nombre} (${aeropuerto.codigoIATA})`);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <label style={styles.label}>{label}</label>
      <div style={styles.inputWrapper}>
        <input
          type="text"
          value={displayQuery}
          onChange={handleInput}
          onFocus={() => {
            if (filtered.length > 0 || query.length === 0) {
              setFiltered(aeropuertos.slice(0, 8));
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          style={styles.input}
          autoComplete="off"
        />
      </div>

      {open && filtered.length > 0 && (
        <div style={styles.dropdown}>
          {filtered.map((a) => (
            <button
              key={a.aeropuertoId}
              type="button"
              onClick={() => handleSelect(a)}
              style={styles.option}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EEF4FF'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={styles.optionLeft}>
                <span style={styles.nombre}>{a.nombre}</span>
                <span style={styles.subtitle}>{a.codigoIATA} &middot; {a.nombreCiudad}, {a.nombrePais}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#003580',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '4px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '2px solid #E7E7E7',
    paddingBottom: '6px',
    transition: 'border-color 0.2s',
  },
  icon: {
    fontSize: '18px',
    color: '#006CE4',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    fontWeight: 600,
    color: '#1A1A1A',
    background: 'transparent',
    fontFamily: 'inherit',
    padding: '2px 0',
    minWidth: 0,
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 8px 32px rgba(0,53,128,0.16)',
    border: '1px solid #E7E7E7',
    zIndex: 999,
    overflow: 'hidden',
    maxHeight: '280px',
    overflowY: 'auto',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s',
    borderBottom: '1px solid #F5F5F5',
  },
  optionLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  nombre: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: '12px',
    color: '#4C4C4C',
  },
  plane: {
    color: '#006CE4',
    fontSize: '14px',
  },
};

export default AirportInput;