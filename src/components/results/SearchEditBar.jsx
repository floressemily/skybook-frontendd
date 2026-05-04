// src/components/results/SearchEditBar.jsx
import { useState } from 'react';

const SearchEditBar = ({ params = {}, onSearch }) => {
    const [origen, setOrigen] = useState(params.origen || '');
    const [destino, setDestino] = useState(params.destino || '');
    const [fecha, setFecha] = useState(params.fecha || '');
    const [tripType, setTripType] = useState('Solo ida');
    const [pax, setPax] = useState('1 adulto · Económica');

    const swap = () => {
        const tmp = origen;
        setOrigen(destino);
        setDestino(tmp);
    };

    const handleSearch = () => {
        if (onSearch) onSearch({ origen, destino, fecha });
    };

    return (
        <div className="search-edit-bar">
            <div className="search-edit-bar__inner">

                {/* Tipo viaje */}
                <select
                    className="seb__trip-select"
                    value={tripType}
                    onChange={e => setTripType(e.target.value)}
                >
                    <option>Solo ida</option>
                    <option>Ida y vuelta</option>
                    <option>Multidestino</option>
                </select>

                {/* Pasajeros */}
                <button type="button" className="seb__pax">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                    {pax}
                </button>

                <div className="seb__divider" />

                {/* Origen */}
                <div className="seb__field" style={{ maxWidth: 160 }}>
                    <span className="seb__field-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                        </svg>
                    </span>
                    <div>
                        <div className="seb__field-text">{origen || 'Origen'}</div>
                        <div className="seb__field-sub">Aeropuerto</div>
                    </div>
                </div>

                {/* Swap */}
                <button type="button" className="seb__swap" onClick={swap} title="Invertir ruta">
                    ⇄
                </button>

                {/* Destino */}
                <div className="seb__field" style={{ maxWidth: 160 }}>
                    <span className="seb__field-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.5 19h19v2h-19zm7.18-1.73l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-4.07-1.09L14 12l-1-.27V6l-1.5-.5L11 10.5l-4.12-1.1-.5-1.9-1-.27-.27 3.79 4.57 6.25z" />
                        </svg>
                    </span>
                    <div>
                        <div className="seb__field-text">{destino || 'Destino'}</div>
                        <div className="seb__field-sub">Aeropuerto</div>
                    </div>
                </div>

                <div className="seb__divider" />

                {/* Fecha salida */}
                <div className="seb__field" style={{ maxWidth: 140 }}>
                    <span className="seb__field-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                        </svg>
                    </span>
                    <div>
                        <div className="seb__field-text">{fecha || 'Fecha ida'}</div>
                        <div className="seb__field-sub">Salida</div>
                    </div>
                </div>

                {/* Fecha regreso */}
                <div className="seb__field" style={{ maxWidth: 140 }}>
                    <span className="seb__field-icon" style={{ color: '#999' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                        </svg>
                    </span>
                    <div>
                        <div className="seb__field-text" style={{ color: '#999' }}>Fecha vuelta</div>
                        <div className="seb__field-sub">Regreso</div>
                    </div>
                </div>

                {/* Botón buscar */}
                <button type="button" className="seb__search-btn" onClick={handleSearch}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    Buscar
                </button>
            </div>
        </div>
    );
};

export default SearchEditBar;