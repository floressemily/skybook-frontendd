// src/components/results/SortTabs.jsx
// Tabs de ordenamiento. Muestra precio mínimo y más rápido usando PrecioBase real.
// Si no hay precios reales, muestra "—" (nunca inventa valores).

const norm = (obj, ...keys) => {
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
    const lc = k.charAt(0).toLowerCase() + k.slice(1);
    if (obj[lc] != null) return obj[lc];
  }
  return null;
};

const calcDurMs = (v) => {
  const s = new Date(norm(v, 'fechaSalida', 'FechaSalida') ?? '');
  const l = new Date(norm(v, 'fechaLlegadaEstimada', 'FechaLlegadaEstimada') ?? '');
  return (!isNaN(s) && !isNaN(l)) ? l - s : Infinity;
};

const formatPrecio = (p) =>
  p != null ? `desde $${Number(p).toFixed(2)}` : '—';

const SortTabs = ({ vuelos = [], activeSort, onSort }) => {

  const precios = vuelos
    .map(v => norm(v, 'precioBase', 'PrecioBase'))
    .filter(p => p != null && p > 0);

  const minBarato = precios.length ? Math.min(...precios) : null;

  // Precio del vuelo más rápido
  let minDurPrice = null;
  if (vuelos.length > 0) {
    const masRapido = vuelos.reduce((acc, v) =>
      calcDurMs(v) < calcDurMs(acc) ? v : acc
    , vuelos[0]);
    minDurPrice = norm(masRapido, 'precioBase', 'PrecioBase');
  }

  const tabs = [
    {
      key: 'cheap',
      label: 'Más barato',
      price: formatPrecio(minBarato),
      hint: 'menor tarifa base',
    },
    {
      key: 'best',
      label: 'El mejor',
      price: formatPrecio(minBarato),
      hint: 'precio + duración',
    },
    {
      key: 'fastest',
      label: 'Más rápido',
      price: formatPrecio(minDurPrice),
      hint: 'menor duración',
    },
  ];

  return (
    <div className="sort-tabs">
      {tabs.map(tab => (
        <button
          key={tab.key}
          type="button"
          className={`sort-tab ${activeSort === tab.key ? 'active' : ''}`}
          onClick={() => onSort(tab.key)}
        >
          <span className="sort-tab__label">{tab.label}</span>
          <span className="sort-tab__price">{tab.price}</span>
          <span className="sort-tab__hint">{tab.hint}</span>
        </button>
      ))}
    </div>
  );
};

export default SortTabs;