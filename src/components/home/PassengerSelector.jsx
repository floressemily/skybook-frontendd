// src/components/home/PassengerSelector.jsx
import { useState, useRef, useEffect } from 'react';

const Counter = ({ label, sub, val, onDec, onInc, min = 0 }) => (
  <div style={styles.row}>
    <div>
      <div style={styles.rowLabel}>{label}</div>
      <div style={styles.rowSub}>{sub}</div>
    </div>
    <div style={styles.counter}>
      <button type="button" onClick={onDec} disabled={val <= min} style={styles.btn}>−</button>
      <span style={styles.count}>{val}</span>
      <button type="button" onClick={onInc} style={styles.btn}>+</button>
    </div>
  </div>
);

const PassengerSelector = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [adults, setAdults] = useState(value?.adults ?? 1);
  const [children, setChildren] = useState(value?.children ?? 0);
  const [infants, setInfants] = useState(value?.infants ?? 0);
  const [clase, setClase] = useState(value?.clase ?? 'Económica');
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    onChange({ adults, children, infants, clase });
  }, [adults, children, infants, clase, onChange]);

  const total = adults + children + infants;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={styles.trigger}>
        <span style={styles.triggerText}>
          {total} {total === 1 ? 'pasajero' : 'pasajeros'} · {clase}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div style={styles.panel}>
          <Counter
            label="Adultos" sub="12+ años"
            val={adults} min={1}
            onDec={() => setAdults(a => Math.max(1, a - 1))}
            onInc={() => setAdults(a => a + 1)}
          />
          <Counter
            label="Niños" sub="2–11 años"
            val={children} min={0}
            onDec={() => setChildren(c => Math.max(0, c - 1))}
            onInc={() => setChildren(c => c + 1)}
          />
          <Counter
            label="Bebés" sub="Menor de 2"
            val={infants} min={0}
            onDec={() => setInfants(i => Math.max(0, i - 1))}
            onInc={() => setInfants(i => i + 1)}
          />

          <div style={styles.divider} />
          <div style={styles.claseLabel}>Clase</div>
          <div style={styles.clases}>
            {['Económica', 'Business', 'Primera'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setClase(c)}
                style={{
                  ...styles.claseBtn,
                  ...(clase === c ? styles.claseBtnActive : {}),
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setOpen(false)} style={styles.done}>
            Listo
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: '1px solid #E7E7E7',
    borderRadius: '8px',
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    color: '#1A1A1A',
  },
  triggerText: { fontWeight: 600, fontSize: '13px' },
  panel: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 12px 40px rgba(0,53,128,0.18)',
    border: '1px solid #E7E7E7',
    zIndex: 999,
    padding: '20px',
    width: '280px',
    maxWidth: 'calc(100vw - 48px)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #F5F5F5',
  },
  rowLabel: { fontWeight: 600, color: '#1A1A1A', fontSize: '14px' },
  rowSub: { fontSize: '12px', color: '#4C4C4C' },
  counter: { display: 'flex', alignItems: 'center', gap: '12px' },
  btn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '1.5px solid #006CE4',
    background: '#fff',
    color: '#006CE4',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    lineHeight: 1,
  },
  count: { fontWeight: 700, fontSize: '16px', minWidth: '20px', textAlign: 'center' },
  divider: { borderBottom: '1px solid #E7E7E7', margin: '12px 0 10px' },
  claseLabel: { fontSize: '12px', fontWeight: 700, color: '#003580', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  clases: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' },
  claseBtn: {
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1.5px solid #E7E7E7',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    color: '#4C4C4C',
    transition: 'all 0.15s',
  },
  claseBtnActive: {
    border: '1.5px solid #006CE4',
    background: '#EEF4FF',
    color: '#006CE4',
  },
  done: {
    width: '100%',
    padding: '10px',
    background: '#006CE4',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
};

export default PassengerSelector;