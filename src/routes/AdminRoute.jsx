import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Sin token o sin usuario autenticado
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Validar rol de administrador (case-insensitive)
  const roles = user.roles || [];
  const isAdmin = roles.some(r => r.toLowerCase() === 'admin');

  if (!isAdmin) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', marginTop: '50px' }}>
        <h2 style={{ color: '#d93025' }}>Acceso denegado</h2>
        <p>No tienes los permisos necesarios para ver esta página.</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#003580',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  // Con rol ADMIN -> permitir acceso
  return children;
};

export default AdminRoute;
