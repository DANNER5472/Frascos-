import { Calendar, X } from 'lucide-react';

export default function DateSearch({ onDateSelect, selectedDate, onClear }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.2rem',
      padding: '0.4rem 0.6rem',
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '0.4rem',
      width: '100%',
      height: '36px'
    }}>
      <Calendar style={{ width: '14px', height: '14px', color: '#60a5fa', flexShrink: 0 }} />
      
      <input
        type="date"
        value={selectedDate || ''}
        onChange={(e) => onDateSelect(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#f3f4f6',
          fontSize: '0.7rem',
          fontWeight: '500',
          outline: 'none',
          cursor: 'pointer',
          width: '100%',
          minWidth: '0'
        }}
      />
      
      {selectedDate && (
        <button
          onClick={onClear}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: 'none',
            color: '#f87171',
            padding: '0.2rem',
            borderRadius: '0.2rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          title="Limpiar"
        >
          <X style={{ width: '12px', height: '12px' }} />
        </button>
      )}
    </div>
  );
}