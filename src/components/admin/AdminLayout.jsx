// src/components/admin/AdminLayout.jsx

import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import '../../styles/admin/admin.css';

const AdminLayout = () => {
    return (
        <div className="admin-root">
            <div className="admin-wrapper">
                <AdminSidebar />
                <main className="admin-main">
                    <div className="admin-content">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;