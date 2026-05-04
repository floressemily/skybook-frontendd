// src/components/admin/AdminSidebar.jsx

import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin/sidebar.css';

// ============================================================
// ADMINSIDEBAR
// Rediseño elegante y jerárquico. Sin iconos, solo texto.
// ============================================================

const NAV_ITEMS = [
    {
        section: 'PRINCIPAL',
        items: [
            { path: '/admin', label: 'Dashboard' },
        ],
    },
    {
        section: 'OPERACIONES',
        items: [
            { path: '/admin/flights', label: 'Vuelos' },
            { path: '/admin/routes', label: 'Rutas' },
            { path: '/admin/airports', label: 'Aeropuertos' },
            { path: '/admin/aircraft', label: 'Aviones' },
        ],
    },
    {
        section: 'COMERCIAL',
        items: [
            { path: '/admin/bookings', label: 'Reservas' },
            { path: '/admin/payments', label: 'Pagos' },
            { path: '/admin/customers', label: 'Clientes' },
        ],
    },
    {
        section: 'SISTEMA',
        items: [
            { path: '/admin/users', label: 'Usuarios' },
        ],
    },
];

const AdminSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="admin-sidebar">

            {/* ── MARCA / LOGO ── */}
            <div className="admin-sidebar__brand">
                <div className="admin-sidebar__brand-name">
                    <span className="admin-sidebar__brand-title">AeroBook</span>
                    <span className="admin-sidebar__brand-sub">Panel de Control</span>
                </div>
            </div>

            {/* ── NAVEGACIÓN ── */}
            <nav className="admin-sidebar__nav">
                {NAV_ITEMS.map((group) => (
                    <div key={group.section} className="admin-sidebar__section">

                        <span className="admin-sidebar__section-label">
                            {group.section}
                        </span>

                        <div className="admin-sidebar__items">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={`admin-sidebar__item ${isActive(item.path) ? 'active' : ''}`}
                                >
                                    <span className="admin-sidebar__item-label">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ── FOOTER: USUARIO LOGUEADO ── */}
            <div className="admin-sidebar__footer">
                <div className="admin-sidebar__user">
                    <div className="admin-sidebar__user-info">
                        <span className="admin-sidebar__user-name">
                            {user?.nombre || user?.userName || "Administrador"}
                        </span>
                        <span className="admin-sidebar__user-role">
                            {user?.roles?.[0] || "ADMIN"}
                        </span>
                    </div>
                    <button className="admin-sidebar__logout-btn" onClick={logout}>
                        Salir
                    </button>
                </div>
            </div>

        </aside>
    );
};

export default AdminSidebar;