// src/components/home/HeroSection.jsx
// IMÁGENES: coloca tus archivos en src/assets/images/ y ajusta los imports
// hero-main.svg     → imagen principal de vuelo
// hero-secondary.svg → imagen secundaria de destino nacional

const heroImg1 = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200';
const heroImg2 = 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=1200';

const HeroSection = () => {
  return (
    <section style={styles.hero}>
      <div style={styles.container}>
        <div style={styles.left}>
          <div style={styles.badge}>Vuelos nacionales en Ecuador</div>
          <h1 style={styles.h1}>Encuentra vuelos dentro de Ecuador</h1>
          <p style={styles.subtitle}>
            Busca vuelos nacionales de forma rápida y segura, conectando Quito, Guayaquil, Cuenca y Manta con rutas claras.
          </p>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <span style={styles.statNum}>4</span>
              <span style={styles.statLabel}>Ciudades principales</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>100%</span>
              <span style={styles.statLabel}>Vuelos nacionales</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>Rutas</span>
              <span style={styles.statLabel}>Disponibles todo el año</span>
            </div>
          </div>
        </div>
        <div style={styles.right}>
          <div style={styles.imgComposition}>
            <div style={styles.circle1} />
            <div style={styles.circle2} />
            <div style={styles.imgMainWrapper}>
              <img src={heroImg1} alt="Avión sobre Ecuador" style={styles.img} />
              <div style={styles.imgGradient} />
              <div style={styles.floatingBadge}>
                <div>
                  <div style={styles.floatingTitle}>Rutas directas</div>
                  <div style={styles.floatingSubtitle}>Disponibles desde aeropuertos locales</div>
                </div>
              </div>
            </div>
            <div style={styles.imgSecondaryWrapper}>
              <img src={heroImg2} alt="Destino nacional" style={styles.img} />
              <div style={styles.priceChip}>Planificación simple</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const styles = {
  hero: {
    paddingTop: '48px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '48px',
    alignItems: 'center',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    color: '#003580',
    fontSize: '13px',
    fontWeight: 700,
    padding: '8px 16px',
    borderRadius: '22px',
    border: '1px solid rgba(0,108,228,0.18)',
  },
  h1: {
    fontSize: 'clamp(36px, 4vw, 56px)',
    fontWeight: 800,
    color: '#1A1A1A',
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
  },
  subtitle: {
    fontSize: '16px',
    color: '#4C4C4C',
    lineHeight: 1.75,
    maxWidth: '520px',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statNum: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#003580',
  },
  statLabel: {
    fontSize: '12px',
    color: '#4C4C4C',
    fontWeight: 600,
  },
  statDivider: {
    width: '1px',
    height: '36px',
    backgroundColor: '#E7E7E7',
  },
  right: {
    display: 'flex',
    justifyContent: 'center',
  },
  imgComposition: {
    position: 'relative',
    width: '100%',
    maxWidth: '480px',
    height: '340px',
  },
  circle1: {
    position: 'absolute',
    top: '-16px',
    right: '16px',
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'rgba(0,108,228,0.12)',
    zIndex: 0,
  },
  circle2: {
    position: 'absolute',
    bottom: '24px',
    left: '0',
    width: '92px',
    height: '92px',
    borderRadius: '50%',
    background: 'rgba(0,53,128,0.1)',
    zIndex: 0,
  },
  imgMainWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '72%',
    height: '86%',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 28px 60px rgba(0,53,128,0.18)',
    zIndex: 2,
    backgroundColor: '#C8D8EE',
  },
  imgSecondaryWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '56%',
    height: '62%',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 18px 44px rgba(0,0,0,0.14)',
    zIndex: 3,
    border: '3px solid #fff',
    backgroundColor: '#D4E8D4',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  imgGradient: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,53,128,0.45) 0%, transparent 60%)',
  },
  floatingBadge: {
    position: 'absolute',
    bottom: '18px',
    left: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid rgba(0,53,128,0.16)',
    zIndex: 4,
  },
  floatingTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#003580',
  },
  floatingSubtitle: {
    fontSize: '11px',
    color: '#4C4C4C',
  },
  priceChip: {
    position: 'absolute',
    top: '14px',
    left: '14px',
    backgroundColor: '#FFB700',
    color: '#1A1A1A',
    padding: '8px 12px',
    borderRadius: '14px',
    fontSize: '12px',
    fontWeight: 700,
  },
};

export default HeroSection;