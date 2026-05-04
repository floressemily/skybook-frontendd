import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, cliente, logout, isAuthenticated } = useAuth();

  // Priorizar nombre de usuarioApp, sino el del cliente
  const displayName = user?.nombre || user?.userName || cliente?.nombre || 'Usuario';

  // Detectar la ruta actual para el estilo activo
  const isVuelosActivo = location.pathname === '/' || location.pathname.startsWith('/results') || location.pathname.startsWith('/flight/');
  const isAdminActivo = location.pathname.startsWith('/admin');

  return (
    <header style={headerStyles.stickyHeader}>
      <div style={headerStyles.topBar}>
        <div style={headerStyles.container}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={headerStyles.brand}>
              <div style={headerStyles.brandMark}>S</div>
              <div>
                <div style={headerStyles.brandName}>SkyBook</div>
              </div>
            </div>
          </Link>
          <div style={headerStyles.rightControls}>
            <button type="button" style={headerStyles.langBtn}>ES</button>
            
            {isAuthenticated ? (
              <>
                <span style={headerStyles.welcomeText}>Hola, {displayName}</span>
                <button type="button" style={headerStyles.authBtn} onClick={logout}>Cerrar sesión</button>
              </>
            ) : (
              <>
                <button type="button" style={headerStyles.authBtn} onClick={() => navigate('/login')}>Iniciar sesión</button>
                <button type="button" style={headerStyles.registerBtn} onClick={() => navigate('/register')}>Registrarse</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={headerStyles.subBar}>
        <div style={headerStyles.container}>
          <nav style={headerStyles.nav}>
            <button 
              type="button" 
              onClick={() => navigate('/')}
              style={{ 
                ...headerStyles.navItem, 
                ...(isVuelosActivo ? headerStyles.navItemActive : {}) 
              }}
            >
              Vuelos
            </button>
            {user?.roles?.some(r => r.toLowerCase() === 'admin') && (
              <button 
                type="button" 
                onClick={() => navigate('/admin')}
                style={{ 
                  ...headerStyles.navItem, 
                  ...(isAdminActivo ? headerStyles.navItemActive : {}) 
                }}
              >
                Panel Admin
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

const headerStyles = {
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    width: '100%',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  topBar: {
    backgroundColor: '#003580',
    padding: '0',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  brandMark: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#FFB700',
    display: 'grid',
    placeItems: 'center',
    color: '#003580',
    fontWeight: 800,
    fontSize: '18px',
  },
  brandName: {
    fontSize: '17px',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  brandTag: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.85)',
    marginTop: '2px',
  },
  rightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  welcomeText: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    marginRight: '10px',
  },
  langBtn: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: '#fff',
    padding: '8px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: 'inherit',
  },
  authBtn: {
    background: 'transparent',
    border: '1.5px solid rgba(255,255,255,0.55)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: 'inherit',
  },
  registerBtn: {
    background: '#FFB700',
    border: 'none',
    color: '#003580',
    padding: '8px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 800,
    fontFamily: 'inherit',
  },
  subBar: {
    backgroundColor: '#003580',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  nav: {
    display: 'flex',
  },
  navItem: {
    padding: '14px 18px',
    border: 'none',
    borderRadius: '12px',
    background: 'transparent',
    color: 'rgba(255,255,255,0.75)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  navItemActive: {
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.08)',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
  },
};

export default Navbar;
