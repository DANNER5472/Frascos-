import { useState, useEffect } from 'react';
import { X, ShoppingCart } from 'lucide-react';

export default function EditSaleModal({ 
  isOpen, 
  onClose, 
  onSave, 
  sale 
}) {
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sale) {
      setQuantity(sale.quantity.toString());
      setUnitPrice(sale.unit_price.toString());
      setNotes(sale.notes || '');
    }
  }, [sale]);

  if (!isOpen || !sale) return null;

  const totalAmount = quantity && unitPrice 
    ? (parseInt(quantity) * parseFloat(unitPrice)).toFixed(2) 
    : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await onSave({
      id: sale.id,
      quantity: parseInt(quantity),
      unit_price: parseFloat(unitPrice),
      notes
    });

    setLoading(false);
    if (result) {
      onClose();
    }
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
          maxWidth: '550px',
          background: 'linear-gradient(to bottom, #1f2937, #111827)',
          borderRadius: '1.5rem',
          border: '2px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
          padding: '2rem',
          animation: 'slideUp 0.3s ease-out',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '0.75rem',
              borderRadius: '1rem'
            }}>
              <ShoppingCart style={{ width: '28px', height: '28px', color: '#10b981' }} />
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#f9fafb',
              margin: 0
            }}>
              Editar Venta
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#e5e7eb',
                marginBottom: '0.5rem'
              }}>
                Cantidad de Frascos *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #374151',
                  borderRadius: '0.75rem',
                  background: '#1f2937',
                  color: '#f3f4f6',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                min="1"
                required
                disabled={loading}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#374151'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#e5e7eb',
                marginBottom: '0.5rem'
              }}>
                Precio por Frasco (Bs.) *
              </label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #374151',
                  borderRadius: '0.75rem',
                  background: '#1f2937',
                  color: '#f3f4f6',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                min="0.01"
                required
                disabled={loading}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#374151'}
              />
            </div>
          </div>

          {/* Cálculo automático */}
          {quantity && unitPrice && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.75rem',
              padding: '0.75rem'
            }}>
              <p style={{ color: '#6ee7b7', fontSize: '0.875rem', margin: 0 }}>
                Total de la venta: <span style={{ fontWeight: 'bold', color: '#34d399' }}>Bs. {totalAmount}</span>
              </p>
            </div>
          )}

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#e5e7eb',
              marginBottom: '0.5rem'
            }}>
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #374151',
                borderRadius: '0.75rem',
                background: '#1f2937',
                color: '#f3f4f6',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: '80px'
              }}
              placeholder="Ej: Venta al cliente María"
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = '#10b981'}
              onBlur={(e) => e.target.style.borderColor = '#374151'}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.875rem 1.5rem',
                borderRadius: '1rem',
                border: '2px solid #374151',
                background: 'rgba(31, 41, 55, 0.8)',
                color: '#d1d5db',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'rgba(55, 65, 81, 0.8)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'rgba(31, 41, 55, 0.8)')}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.875rem 1.5rem',
                borderRadius: '1rem',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
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