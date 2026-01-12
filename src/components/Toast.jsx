import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'rgba(34, 197, 94, 0.15)',
      borderColor: 'rgba(34, 197, 94, 0.4)',
      textColor: '#86efac',
      iconColor: '#22c55e'
    },
    error: {
      icon: XCircle,
      bgColor: 'rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.4)',
      textColor: '#fca5a5',
      iconColor: '#ef4444'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'rgba(249, 115, 22, 0.15)',
      borderColor: 'rgba(249, 115, 22, 0.4)',
      textColor: '#fdba74',
      iconColor: '#f97316'
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        zIndex: 9999,
        minWidth: '320px',
        maxWidth: '500px',
        background: bgColor,
        backdropFilter: 'blur(20px)',
        border: `2px solid ${borderColor}`,
        borderRadius: '1rem',
        padding: '1rem 1.5rem',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <Icon style={{ width: '24px', height: '24px', color: iconColor, flexShrink: 0 }} />
      
      <p style={{
        flex: 1,
        color: textColor,
        fontWeight: '600',
        fontSize: '0.95rem',
        margin: 0
      }}>
        {message}
      </p>

      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          color: textColor,
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        <X style={{ width: '20px', height: '20px' }} />
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}