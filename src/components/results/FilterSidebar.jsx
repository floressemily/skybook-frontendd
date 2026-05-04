const FilterSidebar = ({ filters, setFilters, aerolineas, estados }) => {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.panel}>
        <h2 style={styles.title}>Filtrar resultados</h2>

        <label style={styles.label}>
          Aerolínea
          <select
            style={styles.select}
            value={filters.aerolinea}
            onChange={(e) => setFilters((current) => ({ ...current, aerolinea: e.target.value }))}
          >
            <option value="Todas">Todas</option>
            {aerolineas.map((aerolinea) => (
              <option key={aerolinea} value={aerolinea}>{aerolinea}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Estado
          <select
            style={styles.select}
            value={filters.estado}
            onChange={(e) => setFilters((current) => ({ ...current, estado: e.target.value }))}
          >
            <option value="Todos">Todos</option>
            {estados.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Horario
          <select
            style={styles.select}
            value={filters.horario}
            onChange={(e) => setFilters((current) => ({ ...current, horario: e.target.value }))}
          >
            <option value="Todos">Todos</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Noche">Noche</option>
          </select>
        </label>

        <label style={styles.label}>
          Escalas
          <select
            style={styles.select}
            value={filters.escalas}
            onChange={(e) => setFilters((current) => ({ ...current, escalas: e.target.value }))}
          >
            <option value="Todos">Todos</option>
            <option value="Directo">Directo</option>
            <option value="Con escala">Con escala</option>
          </select>
        </label>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    position: 'sticky',
    top: '24px',
    alignSelf: 'start',
  },
  panel: {
    display: 'grid',
    gap: '18px',
    padding: '24px',
    borderRadius: '24px',
    backgroundColor: '#fff',
    boxShadow: '0 20px 50px rgba(25, 70, 111, 0.08)',
  },
  title: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#102A43',
  },
  label: {
    display: 'grid',
    gap: '10px',
    color: '#334E68',
    fontSize: '0.95rem',
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid #D9E2EC',
    backgroundColor: '#F8FAFC',
    fontSize: '0.95rem',
    color: '#102A43',
  },
};

export default FilterSidebar;
