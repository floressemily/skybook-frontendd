// src/components/common/Footer.jsx

const Footer = () => (
  <footer style={footerStyles.footer}>
    <div style={footerStyles.container}>
      <div style={footerStyles.logo}>SkyBook</div>
      <p style={footerStyles.copy}>© 2026 SkyBook. Todos los derechos reservados.</p>
    </div>
  </footer>
);

const footerStyles = {
  footer: {
    backgroundColor: '#003580',
    padding: '24px 0',
    width: '100%',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    color: '#fff',
    fontWeight: 800,
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  copy: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
  },
};

export default Footer;
