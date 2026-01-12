import { Download, RefreshCw, Calendar } from 'lucide-react';
import DateSearch from './DateSearch';

export default function ResponsiveFilters({ 
  dateFilter, 
  setDateFilter, 
  specificDate, 
  setSpecificDate,
  onRefresh,
  onExport,
  onClearDate,
  data,
  loading
}) {
  const isMobile = window.innerWidth < 768;

  const filters = [
    { value: 'all', label: 'Todas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: '7 días' },
    { value: 'month', label: '30 días' }
  ];

  if (isMobile) {
    // VISTA MÓVIL - Diseño vertical compacto
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        {/* Fila 1: Filtros de tiempo - MÁS COMPACTOS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.25rem'
        }}>
          {filters.map(filter => (
            <button
              key={filter.value}
              onClick={() => {
                setDateFilter(filter.value);
                setSpecificDate('');
              }}
              style={{
                padding: '0.5rem 0.25rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: dateFilter === filter.value 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'rgba(31, 41, 55, 0.8)',
                color: dateFilter === filter.value ? '#ffffff' : '#9ca3af',
                border: dateFilter === filter.value ? 'none' : '1px solid rgba(148, 163, 184, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: dateFilter === filter.value 
                  ? '0 2px 8px rgba(59, 130, 246, 0.3)'
                  : 'none'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Fila 2: Calendario + Botones de acción - TODO EN UNA LÍNEA */}
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          alignItems: 'center'
        }}>
          {/* Calendario compacto */}
          <div style={{ flex: '1', minWidth: '0' }}>
            <DateSearch 
              onDateSelect={(date) => {
                setSpecificDate(date);
                setDateFilter('all');
              }}
              selectedDate={specificDate}
              onClear={onClearDate}
            />
          </div>

          {/* Botones más pequeños */}
          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              background: 'rgba(31, 41, 55, 0.8)',
              color: '#60a5fa',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              minWidth: '40px'
            }}
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onExport}
            disabled={data.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: data.length === 0 
                ? 'rgba(31, 41, 55, 0.5)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              cursor: data.length === 0 ? 'not-allowed' : 'pointer',
              opacity: data.length === 0 ? 0.5 : 1,
              boxShadow: data.length > 0 ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
              minWidth: '40px'
            }}
            title="Exportar PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // VISTA DESKTOP - Diseño horizontal
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap'
    }}>
      {/* Filtros de tiempo */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        background: 'rgba(31, 41, 55, 0.8)',
        padding: '0.25rem',
        borderRadius: '0.75rem',
        border: '1px solid #374151'
      }}>
        {filters.map(filter => (
          <button
            key={filter.value}
            onClick={() => {
              setDateFilter(filter.value);
              setSpecificDate('');
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              background: dateFilter === filter.value ? '#3b82f6' : 'transparent',
              color: dateFilter === filter.value ? '#ffffff' : '#9ca3af',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Calendario */}
      <DateSearch 
        onDateSelect={(date) => {
          setSpecificDate(date);
          setDateFilter('all');
        }}
        selectedDate={specificDate}
        onClear={onClearDate}
      />

      {/* Botones de acción */}
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          borderRadius: '0.75rem',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          background: 'rgba(31, 41, 55, 0.8)',
          color: '#60a5fa',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: loading ? 0.5 : 1
        }}
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Actualizando...' : 'Actualizar'}
      </button>

      <button
        onClick={onExport}
        disabled={data.length === 0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          borderRadius: '0.75rem',
          border: 'none',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: data.length === 0 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: data.length === 0 ? 0.5 : 1,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}
      >
        <Download className="w-4 h-4" />
        Exportar PDF
      </button>
    </div>
  );
}