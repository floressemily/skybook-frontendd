// src/routes/AdminRoutes.jsx

import { Routes, Route } from 'react-router-dom';
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
import AdminRoute from './AdminRoute';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index              element={<AdminDashboard />} />
        <Route path="flights"     element={<FlightsPage />}   />
        <Route path="routes"      element={<RoutesPage />}    />
        <Route path="airports"    element={<AirportsPage />}  />
        <Route path="aircraft"    element={<AircraftPage />}  />
        <Route path="bookings"    element={<BookingsPage />}  />
        <Route path="payments"    element={<PaymentsPage />}  />
        <Route path="customers"   element={<CustomersPage />} />
        <Route path="users"       element={<UsersPage />}     />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;