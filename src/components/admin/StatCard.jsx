// src/components/admin/StatCard.jsx

import '../../styles/admin/dashboard.css';

// ============================================================
// STATCARD
// Card de estadística para el Dashboard.
// Uso:
// <StatCard
//   label="Total Reservas"
//   value="1,048"
//   trend="+8%"
//   trendType="up"
//   trendLabel="vs mes anterior"
//   icon="🎫"
//   variant="info"
// />
//
// variants: info | success | error | warning | dark
// trendType: up | down | neutral
// ============================================================

const StatCard = ({
    label = 'Métrica',
    value = '0',
    icon = '📊',
    variant = 'info',
    trend,
    trendType = 'neutral',
    trendLabel = 'vs mes anterior',
    loading = false,
}) => {
    return (
        <div className={`admin-stat-card admin-stat-card--${variant}`}>

            {/* Header: label + icono */}
            <div className="admin-stat-card__header">
                <span className="admin-stat-card__label">{label}</span>
                <div className="admin-stat-card__icon">
                    {icon}
                </div>
            </div>

            {/* Valor principal */}
            <div className="admin-stat-card__value">
                {loading ? '—' : value}
            </div>

            {/* Footer: tendencia */}
            <div className="admin-stat-card__footer">
                {trend && (
                    <span className={`admin-stat-card__trend admin-stat-card__trend--${trendType}`}>
                        {trendType === 'up' && '▲'}
                        {trendType === 'down' && '▼'}
                        {trend}
                    </span>
                )}
                <span>{trendLabel}</span>
            </div>

        </div>
    );
};

export default StatCard;