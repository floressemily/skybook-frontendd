// src/components/home/DatePicker.jsx
import { useState, useRef, useEffect } from 'react';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

const buildCalendar = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

const formatDisplay = (d) => {
  if (!d) return '';
  return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
};

const DatePicker = ({ fechaIda, fechaVuelta, onChange }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selecting, setSelecting] = useState('ida'); // 'ida' | 'vuelta'
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDayClick = (day) => {
    if (!day) return;
    const selected = new Date(viewYear, viewMonth, day);
    if (selected < today) return;

    if (selecting === 'ida') {
      onChange({ fechaIda: selected, fechaVuelta: null });
      setSelecting('vuelta');
    } else {
      if (fechaIda && selected < fechaIda) {
        onChange({ fechaIda: selected, fechaVuelta: null });
        setSelecting('vuelta');
      } else {
        onChange({ fechaIda, fechaVuelta: selected });
        setOpen(false);
        setSelecting('ida');
      }
    }
  };

  const isSelected = (day) => {
    if (!day) return false;
    const d = new Date(viewYear, viewMonth, day);
    return (fechaIda && d.getTime() === fechaIda.getTime()) ||
           (fechaVuelta && d.getTime() === fechaVuelta.getTime());
  };

  const isInRange = (day) => {
    if (!day || !fechaIda || !fechaVuelta) return false;
    const d = new Date(viewYear, viewMonth, day);
    return d > fechaIda && d < fechaVuelta;
  };

  const isPast = (day) => {
    if (!day) return false;
    return new Date(viewYear, viewMonth, day) < today;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = buildCalendar(viewYear, viewMonth);

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <label style={styles.label}>Fechas</label>
      <button type="button" onClick={() => { setOpen((o) => !o); setSelecting('ida'); }} style={styles.trigger}>
        <div style={styles.datesDisplay}>
          <span style={styles.dateChip}>
            {fechaIda ? formatDisplay(fechaIda) : 'Ida'}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
          </svg>
          <span style={styles.dateChip}>
            {fechaVuelta ? formatDisplay(fechaVuelta) : 'Vuelta'}
          </span>
        </div>
      </button>

      {open && (
        <div style={styles.calendar}>
          <div style={styles.calHeader}>
            <div style={styles.selTabs}>
              <button type="button" onClick={() => setSelecting('ida')}
                style={{ ...styles.tab, ...(selecting === 'ida' ? styles.tabActive : {}) }}>
                Ida
              </button>
              <button type="button" onClick={() => setSelecting('vuelta')}
                style={{ ...styles.tab, ...(selecting === 'vuelta' ? styles.tabActive : {}) }}>
                Vuelta
              </button>
            </div>
            <div style={styles.navRow}>
              <button type="button" onClick={prevMonth} style={styles.navBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <span style={styles.monthLabel}>{MESES[viewMonth]} {viewYear}</span>
              <button type="button" onClick={nextMonth} style={styles.navBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>

          <div style={styles.grid}>
            {DIAS_SEMANA.map(d => (
              <div key={d} style={styles.dayHeader}>{d}</div>
            ))}
            {cells.map((day, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={!day || isPast(day)}
                style={{
                  ...styles.day,
                  ...(isSelected(day) ? styles.daySelected : {}),
                  ...(isInRange(day) ? styles.dayInRange : {}),
                  ...(!day || isPast(day) ? styles.dayDisabled : {}),
                }}
              >
                {day || ''}
              </button>
            ))}
          </div>
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
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid #E7E7E7',
    paddingBottom: '6px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  icon: { fontSize: '18px', flexShrink: 0 },
  datesDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0,
  },
  dateChip: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1A1A1A',
    whiteSpace: 'nowrap',
  },
  calendar: {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    left: 0,
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 12px 40px rgba(0,53,128,0.18)',
    border: '1px solid #E7E7E7',
    zIndex: 999,
    padding: '16px',
    width: '320px',
    animation: 'fadeDown 0.18s ease',
  },
  calHeader: { marginBottom: '12px' },
  selTabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '12px',
    background: '#F5F5F5',
    borderRadius: '8px',
    padding: '3px',
  },
  tab: {
    flex: 1,
    padding: '6px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    background: 'transparent',
    color: '#4C4C4C',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: '#fff',
    color: '#003580',
    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    background: 'none',
    border: '1px solid #E7E7E7',
    borderRadius: '6px',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#003580',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { fontWeight: 700, color: '#1A1A1A', fontSize: '14px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
  },
  dayHeader: {
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: 700,
    color: '#4C4C4C',
    padding: '4px 0',
  },
  day: {
    textAlign: 'center',
    padding: '7px 0',
    fontSize: '13px',
    border: 'none',
    background: 'transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#1A1A1A',
    
    fontWeight: 500,
    transition: 'all 0.12s',
  },
  daySelected: {
    background: '#006CE4',
    color: '#fff',
    fontWeight: 700,
    borderRadius: '6px',
  },
  dayInRange: {
    background: '#EEF4FF',
    color: '#003580',
    borderRadius: '0',
  },
  dayDisabled: {
    color: '#ccc',
    cursor: 'not-allowed',
  },
};

export default DatePicker;