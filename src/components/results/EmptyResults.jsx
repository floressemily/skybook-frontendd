const EmptyResults = ({ message }) => {
  return (
    <div style={styles.empty}>
      <p style={styles.title}>Sin resultados</p>
      <p style={styles.message}>{message}</p>
    </div>
  );
};

const styles = {
  empty: {
    padding: '40px 32px',
    borderRadius: '24px',
    backgroundColor: '#fff',
    boxShadow: '0 18px 46px rgba(2, 33, 82, 0.08)',
    textAlign: 'center',
    color: '#334E68',
  },
  title: {
    margin: 0,
    fontSize: '1.65rem',
    fontWeight: 700,
    color: '#102A43',
  },
  message: {
    margin: '16px 0 0',
    fontSize: '1rem',
    lineHeight: 1.7,
  },
};

export default EmptyResults;
