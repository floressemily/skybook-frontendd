// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import Results from '../pages/Results';
import FlightDetail from '../pages/FlightDetail';
import InsurancePage from '../pages/InsurancePage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Payment from '../pages/Payment';
import Confirmation from '../pages/Confirmation';
import CheckInPage from '../pages/CheckInPage';
import AdminRoutes from './AdminRoutes';  // ← cambia esto

// ============================================================
// NOTA: eliminamos el import de AdminDashboard y AdminRoute
// porque AdminRoutes ya maneja internamente el layout completo.
// TODO (Antigravity): mover el guard de autenticación aquí,
// envolviendo <AdminRoutes /> igual que antes hacías con AdminRoute.
// Ejemplo:
// <Route path="/admin/*" element={
//   <AdminRoute>
//     <AdminRoutes />
//   </AdminRoute>
// } />
// ============================================================

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/results" element={<Results />} />
    <Route path="/flight/:vueloId" element={<FlightDetail />} />
    <Route path="/seguro" element={<InsurancePage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/payment" element={<Payment />} />
    <Route path="/confirmation" element={<Confirmation />} />
    <Route path="/checkin" element={<CheckInPage />} />

    {/* Panel Admin completo — todas las subrutas */}
    <Route path="/admin/*" element={<AdminRoutes />} />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;