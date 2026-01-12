import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  type = 'danger' // 'danger' o 'warning'
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: '90%',
          maxWidth: '450px',
          background: 'linear-gradient(to bottom, #1f2937, #111827)',
          borderRadius: '1.5rem',
          border: type === 'danger' ? '2px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(249, 115, 22, 0.3)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
          padding: '2rem',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div style={{
              background: type === 'danger' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.15)',
              padding: '0.75rem',
              borderRadius: '1rem'
            }}>
              <AlertTriangle 
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  color: type === 'danger' ? '#ef4444' : '#f97316' 
                }} 
              />
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#f9fafb',
              margin: 0
            }}>
              {title}
            </h3>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#9ca3af',
              borderRadius: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(55, 65, 81, 0.5)';
              e.currentTarget.style.color = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Message */}
        <p style={{
          color: '#d1d5db',
          fontSize: '1rem',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.875rem 1.5rem',
              borderRadius: '1rem',
              border: '2px solid #374151',
              background: 'rgba(31, 41, 55, 0.8)',
              color: '#d1d5db',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(55, 65, 81, 0.8)';
              e.currentTarget.style.borderColor = '#4b5563';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(31, 41, 55, 0.8)';
              e.currentTarget.style.borderColor = '#374151';
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: '0.875rem 1.5rem',
              borderRadius: '1rem',
              border: 'none',
              background: type === 'danger' 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: type === 'danger'
                ? '0 10px 25px rgba(239, 68, 68, 0.3)'
                : '0 10px 25px rgba(249, 115, 22, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = type === 'danger'
                ? '0 15px 35px rgba(239, 68, 68, 0.4)'
                : '0 15px 35px rgba(249, 115, 22, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = type === 'danger'
                ? '0 10px 25px rgba(239, 68, 68, 0.3)'
                : '0 10px 25px rgba(249, 115, 22, 0.3)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translate(-50%, -45%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}