import HeroSection from '../components/home/HeroSection';
import SearchBox from '../components/home/SearchBox';
import Footer from '../components/common/Footer';

// Header is now global in AppRoutes.jsx

const POPULAR_DESTINATIONS = [
  { ciudad: 'Quito', pais: 'Pichincha', precio: 'Desde $59', img: 'https://plus.unsplash.com/premium_photo-1697729921570-a7e324d7baac?w=800' },
  { ciudad: 'Guayaquil', pais: 'Guayas', precio: 'Desde $49', img: 'https://images.unsplash.com/photo-1628004550522-02dc9cb7456e?w=800' },
  { ciudad: 'Manta', pais: 'Manabí', precio: 'Desde $54', img: 'https://images.unsplash.com/photo-1669315935813-1f93e2dd012d?w=800' },
  { ciudad: 'Galápagos', pais: 'Islas Galápagos', precio: 'Desde $120', img: 'https://images.unsplash.com/photo-1595517930215-d2778a56ac93?w=800' },
];

const DestinationsSection = () => (
  <section style={destStyles.section}>
    <div style={destStyles.container}>
      <div style={destStyles.header}>
        <div>
          <p style={destStyles.overline}>Rutas dentro de Ecuador</p>
          <h2 style={destStyles.title}>Ciudades conectadas con vuelos nacionales</h2>
        </div>
      </div>
      <div style={destStyles.grid}>
        {POPULAR_DESTINATIONS.map((dest) => (
          <div key={dest.ciudad} style={destStyles.card}>
            <div style={destStyles.imgWrapper}>
              <img src={dest.img} alt={dest.ciudad} style={destStyles.cardImg} loading="lazy" />
            </div>
            <div>
              <div style={destStyles.city}>{dest.ciudad}</div>
              <div style={destStyles.country}>{dest.pais}</div>
            </div>
            <div style={destStyles.price}>{dest.precio}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const destStyles = {
  section: {
    padding: '48px 0 64px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  },
  header: {
    marginBottom: '24px',
  },
  overline: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 700,
    color: '#006CE4',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '10px 0 0',
    fontSize: '26px',
    fontWeight: 800,
    color: '#1A1A1A',
    lineHeight: 1.2,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '18px',
  },
  card: {
    display: 'grid',
    gap: '18px',
    padding: '24px',
    borderRadius: '20px',
    backgroundColor: '#fff',
    border: '1px solid #E8EDF7',
    minHeight: '170px',
    boxShadow: '0 14px 30px rgba(0,53,128,0.05)',
  },
  imgWrapper: {
    width: '100%',
    height: '140px',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  city: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#1A1A1A',
  },
  country: {
    fontSize: '14px',
    color: '#4C4C4C',
    marginTop: '6px',
  },
  price: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#006CE4',
  },
};




// ─── HOME PAGE PRINCIPAL ────────────────────────────────────────────────────────
const HomePage = () => {
  return (
    <div style={pageStyles.page}>
      {/* Header is now in AppRoutes.jsx */}

      {/* FONDO HERO */}
      <div style={pageStyles.heroBg}>
        {/* Hero Section: texto + imágenes */}
        <HeroSection />

        {/* SearchBox: flotante, centrado */}
        <div style={pageStyles.searchSection}>
          <div style={pageStyles.searchContainer}>
            <SearchBox />
          </div>
        </div>
      </div>

      {/* Destinos populares */}
      <DestinationsSection />

      <Footer />
    </div>
  );
};

const pageStyles = {
  page: {
    minHeight: '100vh',
    fontFamily: "BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    backgroundColor: '#F5F5F5',
  },
  heroBg: {
    background: 'linear-gradient(180deg, #F0F4FF 0%, #F5F5F5 100%)',
    paddingBottom: '64px',
  },
  searchSection: {
    padding: '32px 24px 0',
    animation: 'fadeIn 0.7s ease 0.2s both',
  },
  searchContainer: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
};

export default HomePage;