import { Calendar } from 'lucide-react';

export default function DateSearch({ onDateSelect, selectedDate, onClear }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 1rem',
      background: 'rgba(59, 130, 246, 0.1)',
      border: '2px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '1rem'
    }}>
      <Calendar className="w-5 h-5 text-blue-400" />
      
      <input
        type="date"
        value={selectedDate || ''}
        onChange={(e) => onDateSelect(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#f3f4f6',
          fontSize: '0.875rem',
          fontWeight: '500',
          outline: 'none',
          cursor: 'pointer'
        }}
      />
      
      {selectedDate && (
        <button
          onClick={onClear}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: 'none',
            color: '#f87171',
            padding: '0.25rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
        >
          Limpiar
        </button>
      )}
    </div>
  );
}