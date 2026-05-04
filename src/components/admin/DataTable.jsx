// src/components/admin/DataTable.jsx

import { useState } from 'react';
import '../../styles/admin/tables.css';

// ============================================================
// DATATABLE
// Tabla reutilizable con búsqueda, filtro y paginación.
//
// Props:
// - columns: array de { key, label, render? }
// - data: array de objetos
// - filterKey: campo por el que se filtra el select (opcional)
// - filterOptions: [{ value, label }] para el select (opcional)
// - loading: boolean
// - emptyText: string
// - actions: fn(row) => JSX  (botones por fila)
// - topRight: JSX (botón "Nuevo" u otro, va en toolbar derecha)
// ============================================================

const PAGE_SIZE = 10;

const DataTable = ({
    columns = [],
    data = [],
    filterKey,
    filterOptions = [],
    loading = false,
    emptyText = 'No hay registros.',
    actions,
    topRight,
    searchPlaceholder = 'Buscar...',
}) => {

    const [search, setSearch] = useState('');
    const [filterVal, setFilterVal] = useState('');
    const [page, setPage] = useState(1);

    // ── Filtrado ──────────────────────────────────────────
    const filtered = data.filter(row => {
        // Búsqueda global en todas las columnas definidas
        const matchSearch = search === '' || columns.some(col => {
            const val = row[col.key];
            return val && String(val).toLowerCase().includes(search.toLowerCase());
        });

        // Filtro por campo específico (ej: estado)
        const matchFilter = !filterKey || filterVal === '' ||
            String(row[filterKey]) === filterVal;

        return matchSearch && matchFilter;
    });

    // ── Paginación ────────────────────────────────────────
    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleFilter = (e) => {
        setFilterVal(e.target.value);
        setPage(1);
    };

    // ── Páginas visibles en paginador ──────────────────────────
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2; // cuántas páginas mostrar a los lados de la actual
        const left = Math.max(1, page - delta);
        const right = Math.min(totalPages, page + delta);

        for (let i = left; i <= right; i++) {
            pages.push(i);
        }
        return pages;
    };

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className="admin-table-wrap">

            {/* TOOLBAR: Búsqueda y Filtros */}
            <div className="admin-table-toolbar">
                <div className="admin-table-toolbar__left">

                    {/* Caja de Búsqueda */}
                    <div className="admin-table-search">
                        <span className="admin-table-search__icon">🔍</span>
                        <input
                            type="text"
                            className="admin-table-search__input"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>

                    {/* Filtro por estado u otro campo */}
                    {filterOptions.length > 0 && (
                        <select
                            className="admin-table-filter"
                            value={filterVal}
                            onChange={handleFilter}
                        >
                            <option value="">Todos</option>
                            {filterOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Contador de registros */}
                    <span className="admin-table-count">
                        {totalElements} registro{totalElements !== 1 ? 's' : ''}
                    </span>

                </div>

                {/* Slot derecho: botón "Nuevo" u acción principal */}
                {topRight && (
                    <div className="admin-table-toolbar__right">
                        {topRight}
                    </div>
                )}
            </div>

            {/* TABLA REAL */}
            <div className="admin-table-scroll">
                <table className="admin-table">

                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                            {actions && <th>Acciones</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-muted)' }}
                                >
                                    Cargando...
                                </td>
                            </tr>
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)}>
                                    <div className="admin-empty">
                                        <span className="admin-empty-icon">📭</span>
                                        <span className="admin-empty-text">{emptyText}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginated.map((row, i) => (
                                <tr key={row.id ?? i}>
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td>{actions(row)}</td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>

            {/* FOOTER / PAGINACIÓN */}
            {!loading && totalElements > PAGE_SIZE && (
                <div className="admin-pagination">
                    <span className="admin-pagination__info">
                        Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalElements)} de {totalElements}
                    </span>
                    <div className="admin-pagination__controls">
                        <button
                            className="admin-pagination__btn"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                        >
                            ‹
                        </button>

                        {getPageNumbers().map(n => (
                            <button
                                key={n}
                                className={`admin-pagination__btn ${n === page ? 'active' : ''}`}
                                onClick={() => setPage(n)}
                            >
                                {n}
                            </button>
                        ))}

                        <button
                            className="admin-pagination__btn"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DataTable;