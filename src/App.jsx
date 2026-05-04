import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/common/Navbar';
import './styles/global.css';

/**
 * AppContent maneja la lógica de visualización condicional
 * basándose en la ruta actual.
 */
function AppContent() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <AppRoutes />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <AppContent />
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
