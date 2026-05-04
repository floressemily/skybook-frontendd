const fs = require('fs');
const path = require('path');

const pagesDir = 'c:/Users/milly/source/repos/microservicios/MicroserviciosVuelos/Frontend/src/pages/admin';
const compsDir = 'c:/Users/milly/source/repos/microservicios/MicroserviciosVuelos/Frontend/src/components/admin';

const pagesToFix = [
  'FlightsPage.jsx',
  'RoutesPage.jsx',
  'AirportsPage.jsx',
  'AircraftPage.jsx',
  'BookingsPage.jsx',
  'PaymentsPage.jsx',
  'CustomersPage.jsx',
  'UsersPage.jsx'
];

for (const file of pagesToFix) {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import if not present
  if (!content.includes('useAuth')) {
    content = content.replace(/import \{ useState, useEffect \} from 'react';/, "import { useState, useEffect } from 'react';\nimport { useAuth } from '../../context/AuthContext';");
  }

  // Add const { token } = useAuth(); to the components.
  // We match the component declaration. E.g. const FlightsPage = () => {
  content = content.replace(/const (\w+) = \([^)]*\) => \{/g, (match, p1) => {
    return match + '\n  const { token } = useAuth();';
  });

  // Replace headers
  // The user wrote: // 'Authorization': `Bearer ${token}`
  // Let's just find the commented Authorization and uncomment it
  content = content.replace(/\/\/\s*'Authorization':\s*`Bearer \$\{token\}`/g, "'Authorization': `Bearer ${token}`");
  content = content.replace(/\/\/\s*TODO \(Antigravity\): agregar token JWT\n?/g, "");

  fs.writeFileSync(filePath, content, 'utf8');
}

// Fix Sidebar
const sidebarPath = path.join(compsDir, 'AdminSidebar.jsx');
if (fs.existsSync(sidebarPath)) {
  let content = fs.readFileSync(sidebarPath, 'utf8');
  if (!content.includes('useAuth')) {
    content = content.replace(/import \{ NavLink, useLocation \} from 'react-router-dom';/, "import { NavLink, useLocation } from 'react-router-dom';\nimport { useAuth } from '../../context/AuthContext';");
  }
  content = content.replace(/\/\/ ============================================================\n\/\/ TODO: reemplazar estos datos con los del usuario autenticado.*?\nconst MOCK_USER = \{[\s\S]*?\};\n/m, '');
  content = content.replace(/const AdminSidebar = \(\) => \{/g, "const AdminSidebar = () => {\n    const { user, logout } = useAuth();");
  content = content.replace(/\{MOCK_USER\.initials\}/g, '{user?.nombre?.[0] || user?.userName?.[0] || "A"}');
  content = content.replace(/\{MOCK_USER\.name\}/g, '{user?.nombre || user?.userName || "Admin"}');
  content = content.replace(/\{MOCK_USER\.role\}/g, '{user?.roles?.[0] || "ADMIN"}');
  content = content.replace(/<span className="admin-sidebar__logout" title="Cerrar sesión">/g, "<span className=\"admin-sidebar__logout\" title=\"Cerrar sesión\" onClick={logout}>");
  fs.writeFileSync(sidebarPath, content, 'utf8');
}

// Fix Navbar
const navbarPath = path.join(compsDir, 'AdminNavbar.jsx');
if (fs.existsSync(navbarPath)) {
  let content = fs.readFileSync(navbarPath, 'utf8');
  if (!content.includes('useAuth')) {
    content = content.replace(/import \{ useLocation \} from 'react-router-dom';/, "import { useLocation } from 'react-router-dom';\nimport { useAuth } from '../../context/AuthContext';");
  }
  content = content.replace(/\/\/ ============================================================\n\/\/ TODO: reemplazar con datos reales del usuario autenticado.*?\nconst MOCK_USER = \{[\s\S]*?\};\n/m, '');
  content = content.replace(/const AdminNavbar = \(\) => \{/g, "const AdminNavbar = () => {\n    const { user } = useAuth();");
  content = content.replace(/\{MOCK_USER\.initials\}/g, '{user?.nombre?.[0] || user?.userName?.[0] || "A"}');
  content = content.replace(/\{MOCK_USER\.name\}/g, '{user?.nombre || user?.userName || "Admin"}');
  content = content.replace(/\{MOCK_USER\.role\}/g, '{user?.roles?.[0] || "ADMIN"}');
  fs.writeFileSync(navbarPath, content, 'utf8');
}

console.log('Done!');
