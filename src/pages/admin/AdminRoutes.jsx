// src/routes/AdminRoutes.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import FlightsPage from '../pages/admin/FlightsPage';
import RoutesPage from '../pages/admin/RoutesPage';
import AirportsPage from '../pages/admin/AirportsPage';
import AircraftPage from '../pages/admin/AircraftPage';
import BookingsPage from '../pages/admin/BookingsPage';
import PaymentsPage from '../pages/admin/PaymentsPage';
import CustomersPage from '../pages/admin/CustomersPage';
import UsersPage from '../pages/admin/UsersPage';

// ============================================================
// ADMINROUTES
// Define todas las rutas del panel administrativo.
// AdminLayout envuelve todas las páginas con Sidebar + Navbar.
//
// Para montar este panel en tu app, agrega en tu App.jsx
// o en tu archivo de rutas principal:
//
// import AdminRoutes from './routes/AdminRoutes';
//
// Y dentro de tu <Routes>:
// <Route path="/admin/*" element={<AdminRoutes />} />
//
// TODO (Antigravity): agregar guard de autenticación.
// Antes de renderizar AdminLayout verificar que el usuario
// tenga sesión activa y rol ADMIN u OPERADOR.
// Ejemplo: si no hay token → redirigir a /login
// ============================================================

const AdminGuard = ({ children }) => {
    const { token, user } = useAuth();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const hasAccess = user?.roles?.includes('ADMIN') || user?.roles?.includes('OPERADOR');
    if (!hasAccess) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={
                <AdminGuard>
                    <AdminLayout />
                </AdminGuard>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="flights" element={<FlightsPage />} />
                <Route path="routes" element={<RoutesPage />} />
                <Route path="airports" element={<AirportsPage />} />
                <Route path="aircraft" element={<AircraftPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="users" element={<UsersPage />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;