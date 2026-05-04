const ResultsHeader = ({ origen, destino, fecha, pasajeros, clase, total, loading }) => {
  const summary = origen && destino ? `${origen} → ${destino}` : 'Vuelos disponibles';
  const details = fecha ? `Salida ${fecha}` : 'Fecha de viaje por definir';
  const passengerText = `${pasajeros.adults} adulto${pasajeros.adults !== 1 ? 's' : ''}` +
    (pasajeros.children ? ` · ${pasajeros.children} niño${pasajeros.children !== 1 ? 's' : ''}` : '') +
    (pasajeros.infants ? ` · ${pasajeros.infants} bebé${pasajeros.infants !== 1 ? 's' : ''}` : '');

  return (
    <section style={styles.header}>
      <div>
        <p style={styles.label}>Resultados de búsqueda</p>
        <h1 style={styles.title}>{summary}</h1>
        <p style={styles.subtitle}>{details}</p>
      </div>
      <div style={styles.meta}>
        <span style={styles.metaItem}>{passengerText}</span>
        <span style={styles.metaItem}>{clase}</span>
        <span style={styles.metaItem}>{loading ? 'Buscando...' : `${total} vuelos encontrados`}</span>
      </div>
    </section>
  );
};

const styles = {
  header: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '18px',
    padding: '28px 32px',
    borderRadius: '24px',
    backgroundColor: '#fff',
    boxShadow: '0 24px 60px rgba(2, 33, 82, 0.08)',
  },
  label: {
    margin: 0,
    color: '#0077C8',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontSize: '0.75rem',
  },
  title: {
    margin: '8px 0 0',
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.1,
  },
  subtitle: {
    margin: '12px 0 0',
    color: '#5E6D7A',
    fontSize: '1rem',
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '16px',
  },
  metaItem: {
    padding: '10px 14px',
    borderRadius: '999px',
    backgroundColor: '#F0F7FF',
    color: '#0D3D65',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
};

export default ResultsHeader;
