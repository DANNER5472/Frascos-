import { Edit, Trash2 } from 'lucide-react';

export default function MobileTable({ items, type, onEdit, onDelete }) {
  const isMobile = window.innerWidth < 768;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isMobile) {
    // VISTA MÓVIL - Cards
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: 'rgba(31, 41, 55, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '1rem',
              padding: '1rem',
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            {/* Fecha y Botones */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  background: type === 'sale' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  color: type === 'sale' ? '#34d399' : '#60a5fa',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {formatDate(item.created_at)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => onEdit(item)}
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    color: '#60a5fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Datos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Cantidad:</span>
                <span style={{ color: '#f3f4f6', fontWeight: '600', fontSize: '1rem' }}>
                  {item.quantity} frascos
                </span>
              </div>

              {type === 'sale' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Precio unitario:</span>
                    <span style={{ color: '#34d399', fontWeight: '600' }}>
                      Bs. {parseFloat(item.unit_price).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total:</span>
                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '1.125rem' }}>
                      Bs. {parseFloat(item.total_amount).toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Costo unitario:</span>
                    <span style={{ color: '#60a5fa', fontWeight: '600' }}>
                      Bs. {parseFloat(item.unit_cost || (item.total_price / item.quantity)).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total:</span>
                    <span style={{ color: '#3b82f6', fontWeight: '700', fontSize: '1.125rem' }}>
                      Bs. {parseFloat(item.total_price).toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              {item.notes && (
                <div style={{
                  marginTop: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Nota:</span>
                  <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                    "{item.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // VISTA DESKTOP - Tabla normal
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{
            background: 'rgba(30, 41, 59, 0.8)',
            borderBottom: '2px solid ' + (type === 'sale' ? '#10b981' : '#3b82f6')
          }}>
            <th style={{ padding: '1rem', textAlign: 'left', color: type === 'sale' ? '#34d399' : '#60a5fa', fontSize: '0.875rem', fontWeight: '600' }}>
              FECHA
            </th>
            <th style={{ padding: '1rem', textAlign: 'center', color: type === 'sale' ? '#34d399' : '#60a5fa', fontSize: '0.875rem', fontWeight: '600' }}>
              CANTIDAD
            </th>
            <th style={{ padding: '1rem', textAlign: 'center', color: type === 'sale' ? '#34d399' : '#60a5fa', fontSize: '0.875rem', fontWeight: '600' }}>
              {type === 'sale' ? 'PRECIO/FRASCO' : 'COSTO/FRASCO'}
            </th>
            <th style={{ padding: '1rem', textAlign: 'right', color: type === 'sale' ? '#34d399' : '#60a5fa', fontSize: '0.875rem', fontWeight: '600' }}>
              TOTAL (BS.)
            </th>
            <th style={{ padding: '1rem', textAlign: 'center', color: type === 'sale' ? '#34d399' : '#60a5fa', fontSize: '0.875rem', fontWeight: '600' }}>
              ACCIONES
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              style={{
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '1rem', color: '#e5e7eb', fontSize: '0.875rem' }}>
                {formatDate(item.created_at)}
              </td>
              <td style={{ padding: '1rem', textAlign: 'center', color: type === 'sale' ? '#a78bfa' : '#60a5fa', fontWeight: '600' }}>
                {item.quantity}
              </td>
              <td style={{ padding: '1rem', textAlign: 'center', color: '#fbbf24', fontWeight: '600' }}>
                Bs. {type === 'sale' 
                  ? parseFloat(item.unit_price).toFixed(2)
                  : parseFloat(item.unit_cost || (item.total_price / item.quantity)).toFixed(2)
                }
              </td>
              <td style={{ padding: '1rem', textAlign: 'right', color: type === 'sale' ? '#34d399' : '#60a5fa', fontWeight: '700', fontSize: '1.125rem' }}>
                Bs. {type === 'sale' 
                  ? parseFloat(item.total_amount).toFixed(2)
                  : parseFloat(item.total_price).toFixed(2)
                }
              </td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => onEdit(item)}
                    style={{
                      color: '#60a5fa',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    style={{
                      color: '#f87171',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}