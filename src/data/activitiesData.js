/**
 * Static data definitions for Control de Actividades Contables.
 * Contains all sedes, areas with their activities, and admin configuration.
 */

export const SEDES = [
  'LIMA',
  'PU',
  'IU',
  'CU',
  'JULIACA',
  'TARAPOTO',
  'CAT',
  'ISTAT',
  'CUT',
];

export const AREAS = {
  ventas: {
    name: 'VENTAS',
    icon: '📊',
    color: '#4f8cff',
    activities: [
      { id: 'subida-lotes-ventas', name: 'Subida Lotes Ventas' },
      { id: 'subida-lotes-transferencias', name: 'Subida Lotes Transferencias' },
      { id: 'subida-lotes-anticipos', name: 'Subida Lotes Anticipos' },
      { id: 'cbza-dudosa', name: 'Cbza Dudosa' },
      { id: 'anexos', name: 'Anexos' },
      { id: 'analisis-cuenta-clientes', name: 'Análisis Cuenta Clientes' },
      { id: 'liquidacion', name: 'Liquidación' },
    ],
  },
  compras: {
    name: 'COMPRAS',
    icon: '🛒',
    color: '#7c5cff',
    activities: [
      { id: 'subida-lotes-compras', name: 'Subida Lotes Compras' },
      { id: 'subida-lotes-ajustes-compras', name: 'Subida Lotes Ajustes de Compras' },
      { id: 'liquidacion-compras', name: 'Liquidación Compras' },
      { id: 'liquidacion-honorarios', name: 'Liquidación Honorarios' },
      { id: 'anexo-cta-proveedores', name: 'Anexo Cta Proveedores' },
      { id: 'anexo-cta-honorarios', name: 'Anexo Cta Honorarios' },
    ],
  },
  conciliaciones: {
    name: 'CONCILIACIONES',
    icon: '🏦',
    color: '#00d4ff',
    activities: [
      { id: 'conciliacion-bancos', name: 'Conciliación de bancos' },
      { id: 'fondos-mutuos', name: 'Fondos Mutuos' },
      { id: 'conciliacion-anonimos', name: 'Conciliación Anónimos' },
      { id: 'ajuste-tipo-cambio', name: 'Ajuste Tipo de Cambio' },
      { id: 'descarga-estados-cuenta', name: 'Descarga Estados de Cuenta' },
    ],
  },
};

/** Admin email — the Contador General who manages deadlines */
export const ADMIN_EMAIL = 'contabilidad.universidades@upeu.edu.pe';

/** Total number of sedes (used for progress calculations) */
export const TOTAL_SEDES = SEDES.length; // 9

/** Get all area IDs */
export const AREA_IDS = Object.keys(AREAS); // ['ventas', 'compras', 'conciliaciones']
