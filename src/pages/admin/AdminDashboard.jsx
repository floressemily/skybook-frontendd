// src/pages/admin/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import '../../styles/admin/dashboard.css';
import '../../styles/admin/tables.css';

// ============================================================
// ADMINDASHBOARD
// Página principal del panel administrativo.
//
// APIs conectadas:
// GET /api/v1/dashboard/stats
// GET /api/v1/dashboard/recent-activity
// ============================================================

// Base URL de tu API
// TODO: mover a variable de entorno VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '');

// Íconos para actividad reciente según tipo de evento
const ACTIVITY_ICONS = {
  reserva: { icon: '🎫', bg: '#E8F0FC', color: '#006CE4' },
  pago: { icon: '💳', bg: '#E6F4E6', color: '#008009' },
  cancelacion: { icon: '✖', bg: '#FBEAEA', color: '#D14343' },
  default: { icon: '📋', bg: '#F5F5F5', color: '#6A6A6A' },
};

const AdminDashboard = () => {

  const { token } = useAuth();

  // ── Estado: stats ──────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  // ── Estado: actividad reciente ─────────────────────────────
  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [errorActivity, setErrorActivity] = useState(null);

  // ── Fetch: GET /api/v1/dashboard/stats ────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const res = await fetch(`${API_BASE}/api/v1/dashboard/stats`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        // La API envuelve la respuesta en { data: {...} }
        setStats(json.data ?? json);
      } catch (err) {
        setErrorStats(err.message);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [token]);

  // ── Fetch: GET /api/v1/dashboard/recent-activity ──────────
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoadingActivity(true);
        const res = await fetch(`${API_BASE}/api/v1/dashboard/recent-activity`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        // La API envuelve la respuesta en { data: [...] }
        setActivity(json.data ?? json);
      } catch (err) {
        setErrorActivity(err.message);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchActivity();
  }, [token]);

  // ── Formateo de moneda ─────────────────────────────────────
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '—';
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  // ── Formateo de número ─────────────────────────────────────
  const formatNumber = (val) => {
    if (val === undefined || val === null) return '—';
    return new Intl.NumberFormat('es-EC').format(val);
  };

  // ── Ícono de actividad según tipo ──────────────────────────
  const getActivityIcon = (tipo) => {
    return ACTIVITY_ICONS[tipo?.toLowerCase()] ?? ACTIVITY_ICONS.default;
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div>

      {/* ENCABEZADO */}
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Resumen general del sistema de reservas
          </p>
        </div>
      </div>

      {/* ERROR STATS */}
      {errorStats && (
        <div style={{
          background: 'var(--admin-error-bg)',
          color: 'var(--admin-error)',
          border: '1px solid var(--admin-error)',
          borderRadius: 'var(--admin-radius)',
          padding: '10px 16px',
          marginBottom: '20px',
          fontSize: '13px',
        }}>
          ⚠ No se pudieron cargar las estadísticas: {errorStats}
        </div>
      )}

      {/* STAT CARDS — GET /api/v1/dashboard/stats */}
      <div className="admin-stats-grid">
        <StatCard
          label="Total Vuelos"
          value={formatNumber(stats?.totalVuelos)}
          icon="✈️"
          variant="info"
          loading={loadingStats}
          trendLabel="vuelos registrados"
        />
        <StatCard
          label="Total Reservas"
          value={formatNumber(stats?.totalReservas)}
          icon="🎫"
          variant="dark"
          loading={loadingStats}
          trendLabel="reservas en el sistema"
        />
        <StatCard
          label="Total Clientes"
          value={formatNumber(stats?.totalClientes)}
          icon="👥"
          variant="success"
          loading={loadingStats}
          trendLabel="clientes registrados"
        />
        <StatCard
          label="Ingresos Totales"
          value={formatCurrency(stats?.ingresosTotales)}
          icon="💰"
          variant="warning"
          loading={loadingStats}
          trendLabel="pagos con estado APROBADA"
        />
      </div>

      {/* GRID SECUNDARIO */}
      <div className="admin-dashboard-grid">

        {/* ACTIVIDAD RECIENTE — GET /api/v1/dashboard/recent-activity */}
        <div className="admin-widget">
          <div className="admin-widget__header">
            <div>
              <div className="admin-widget__title">Actividad Reciente</div>
              <div className="admin-widget__subtitle">
                Últimos movimientos del sistema
              </div>
            </div>
          </div>

          <div className="admin-widget__body--flush">
            {loadingActivity ? (
              <div className="admin-empty">
                <span className="admin-empty-text">Cargando actividad...</span>
              </div>
            ) : errorActivity ? (
              <div className="admin-empty">
                <span className="admin-empty-icon">⚠</span>
                <span className="admin-empty-text">
                  No se pudo cargar la actividad
                </span>
              </div>
            ) : activity.length === 0 ? (
              <div className="admin-empty">
                <span className="admin-empty-icon">📭</span>
                <span className="admin-empty-text">Sin actividad reciente</span>
              </div>
            ) : (
              <div className="admin-activity-list">
                {activity.map((item, i) => {
                  const iconData = getActivityIcon(item.tipo);
                  return (
                    <div key={item.id ?? i} className="admin-activity-item">
                      <div
                        className="admin-activity-icon"
                        style={{
                          background: iconData.bg,
                          color: iconData.color,
                        }}
                      >
                        {iconData.icon}
                      </div>
                      <div className="admin-activity-content">
                        {/* 
                          TODO: confirmar con Antigravity los campos exactos
                          que devuelve /api/v1/dashboard/recent-activity
                          Se espera: { id, tipo, descripcion, fecha, estado }
                        */}
                        <div className="admin-activity-text">
                          {item.descripcion ?? item.texto ?? '—'}
                        </div>
                        <div className="admin-activity-time">
                          {item.fecha
                            ? new Date(item.fecha).toLocaleString('es-EC')
                            : item.tiempo ?? '—'}
                        </div>
                      </div>
                      {item.estado && (
                        <StatusBadge status={item.estado} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RESUMEN RÁPIDO */}
        <div className="admin-widget">
          <div className="admin-widget__header">
            <div>
              <div className="admin-widget__title">Resumen</div>
              <div className="admin-widget__subtitle">
                Datos clave del sistema
              </div>
            </div>
          </div>
          <div className="admin-widget__body">
            <div className="admin-kv-list">
              <div className="admin-kv-item">
                <span className="admin-kv-key">Vuelos programados</span>
                {/* TODO: agregar campo programados a /api/v1/dashboard/stats */}
                <span className="admin-kv-value">
                  {formatNumber(stats?.vuelosProgramados) ?? '—'}
                </span>
              </div>
              <div className="admin-kv-item">
                <span className="admin-kv-key">Reservas confirmadas</span>
                {/* TODO: agregar campo reservasConfirmadas a /api/v1/dashboard/stats */}
                <span className="admin-kv-value">
                  {formatNumber(stats?.reservasConfirmadas) ?? '—'}
                </span>
              </div>
              <div className="admin-kv-item">
                <span className="admin-kv-key">Reservas pendientes</span>
                {/* TODO: agregar campo reservasPendientes a /api/v1/dashboard/stats */}
                <span className="admin-kv-value">
                  {formatNumber(stats?.reservasPendientes) ?? '—'}
                </span>
              </div>
              <div className="admin-kv-item">
                <span className="admin-kv-key">Pagos aprobados</span>
                {/* TODO: agregar campo pagosAprobados a /api/v1/dashboard/stats */}
                <span className="admin-kv-value">
                  {formatNumber(stats?.pagosAprobados) ?? '—'}
                </span>
              </div>
              <div className="admin-kv-item">
                <span className="admin-kv-key">Clientes activos</span>
                {/* TODO: agregar campo clientesActivos a /api/v1/dashboard/stats */}
                <span className="admin-kv-value">
                  {formatNumber(stats?.clientesActivos) ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;