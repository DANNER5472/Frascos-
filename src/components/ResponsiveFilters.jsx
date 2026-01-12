import { Download } from 'lucide-react';
import DateSearch from './DateSearch';

export default function ResponsiveFilters({ 
  dateFilter, 
  setDateFilter, 
  specificDate, 
  setSpecificDate,
  onExport,
  onClearDate,
  data
}) {
  const isMobile = window.innerWidth < 768;

  const filters = [
    { value: 'all', label: 'Todas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: '7 días' },
    { value: 'month', label: '30 días' }
  ];

  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1rem',
        padding: '0 0.5rem'
      }}>
        {/* Filtros */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.3rem'
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
                fontSize: '0.7rem',
                fontWeight: '600',
                background: dateFilter === filter.value 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'rgba(31, 41, 55, 0.8)',
                color: dateFilter === filter.value ? '#ffffff' : '#9ca3af',
                border: dateFilter === filter.value ? 'none' : '1px solid rgba(148, 163, 184, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Calendario y PDF */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <DateSearch 
            onDateSelect={(date) => {
              setSpecificDate(date);
              setDateFilter('all');
            }}
            selectedDate={specificDate}
            onClear={onClearDate}
          />

          <button
            onClick={onExport}
            disabled={data.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: data.length === 0 
                ? 'rgba(31, 41, 55, 0.5)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              cursor: data.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.7rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              height: '38px'
            }}
          >
            <Download style={{ width: '14px', height: '14px' }} />
            PDF
          </button>
        </div>
      </div>
    );
  }

  // DESKTOP
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap'
    }}>
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

      <DateSearch 
        onDateSelect={(date) => {
          setSpecificDate(date);
          setDateFilter('all');
        }}
        selectedDate={specificDate}
        onClear={onClearDate}
      />

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
          opacity: data.length === 0 ? 0.5 : 1
        }}
      >
        <Download className="w-4 h-4" />
        Exportar PDF
      </button>
    </div>
  );
}