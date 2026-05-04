// src/components/admin/ActionButtons.jsx

import '../../styles/admin/tables.css';

// ============================================================
// ACTIONBUTTONS
// Botones de acción reutilizables para filas de tablas.
// Uso: <ActionButtons onView={fn} onEdit={fn} onDelete={fn} />
// Puedes pasar solo los que necesites, los demás no aparecen.
// ============================================================

const ActionButtons = ({
    onView,
    onEdit,
    onDelete,
    onConfirm,
    onCancel,
    viewLabel = 'Ver',
    editLabel = 'Editar',
    deleteLabel = 'Eliminar',
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
}) => {
    return (
        <div className="admin-table__actions">

            {/* Ver detalle */}
            {onView && (
                <button
                    className="admin-action-btn admin-action-btn--view"
                    onClick={onView}
                    title={viewLabel}
                >
                    👁
                </button>
            )}

            {/* Editar */}
            {onEdit && (
                <button
                    className="admin-action-btn admin-action-btn--edit"
                    onClick={onEdit}
                    title={editLabel}
                >
                    ✏️
                </button>
            )}

            {/* Confirmar (usado en reservas PENDIENTE_PAGO) */}
            {onConfirm && (
                <button
                    className="admin-action-btn admin-action-btn--view"
                    onClick={onConfirm}
                    title={confirmLabel}
                    style={{ fontSize: '12px' }}
                >
                    ✔
                </button>
            )}

            {/* Cancelar (usado en reservas / vuelos) */}
            {onCancel && (
                <button
                    className="admin-action-btn admin-action-btn--edit"
                    onClick={onCancel}
                    title={cancelLabel}
                    style={{ fontSize: '12px' }}
                >
                    ✖
                </button>
            )}

            {/* Eliminar */}
            {onDelete && (
                <button
                    className="admin-action-btn admin-action-btn--delete"
                    onClick={onDelete}
                    title={deleteLabel}
                >
                    🗑
                </button>
            )}

        </div>
    );
};

export default ActionButtons;