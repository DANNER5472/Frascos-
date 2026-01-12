import { useState, useEffect } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

export default function SalesByDay({ sales }) {
  const [dailyStats, setDailyStats] = useState([]);

  useEffect(() => {
    if (!sales || sales.length === 0) {
      setDailyStats([]);
      return;
    }
    calculateDailyStats();
  }, [sales]);

  const calculateDailyStats = () => {
    const grouped = {};

    sales.forEach(sale => {
      const date = new Date(sale.created_at);
      const dateKey = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
          quantity: 0,
          total: 0,
          count: 0,
          timestamp: date.getTime()
        };
      }

      grouped[dateKey].quantity += parseInt(sale.quantity);
      grouped[dateKey].total += parseFloat(sale.total_amount);
      grouped[dateKey].count += 1;
    });

    // Calcular precio promedio por frasco para cada día
    Object.values(grouped).forEach(day => {
      day.avgPrice = day.quantity > 0 ? day.total / day.quantity : 0;
    });

    // Ordenar por fecha (más reciente primero)
    const sorted = Object.values(grouped).sort((a, b) => b.timestamp - a.timestamp);
    setDailyStats(sorted);
  };

  if (dailyStats.length === 0) {
    return (
      <div style={{
        background: 'rgba(31, 41, 55, 0.9)',
        borderRadius: '1.5rem',
        padding: '2rem',
        border: '2px solid rgba(55, 65, 81, 0.5)',
        textAlign: 'center'
      }}>
        <p style={{ color: '#9ca3af' }}>No hay ventas registradas aún</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#f9fafb',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Calendar style={{ color: '#10b981' }} />
        Ventas por Día
      </h2>

      <div style={{
        background: 'rgba(31, 41, 55, 0.9)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        border: '2px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        overflowX: 'auto'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{
              borderBottom: '2px solid rgba(55, 65, 81, 0.5)'
            }}>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Fecha
              </th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Día
              </th>
              <th style={{
                padding: '1rem',
                textAlign: 'right',
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Frascos
              </th>
              <th style={{
                padding: '1rem',
                textAlign: 'right',
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Precio/Frasco
              </th>
              <th style={{
                padding: '1rem',
                textAlign: 'right',
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Total (Bs.)
              </th>
              <th style={{
                padding: '1rem',
                textAlign: 'right',
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                N° Ventas
              </th>
            </tr>
          </thead>
          <tbody>
            {dailyStats.map((day, index) => (
              <tr
                key={day.date}
                style={{
                  borderBottom: index < dailyStats.length - 1 ? '1px solid rgba(55, 65, 81, 0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{
                  padding: '1rem',
                  color: '#f3f4f6',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>
                  📅 {day.date}
                </td>
                <td style={{
                  padding: '1rem',
                  color: '#d1d5db',
                  fontSize: '0.95rem'
                }}>
                  {day.dayName}
                </td>
                <td style={{
                  padding: '1rem',
                  textAlign: 'right',
                  color: '#10b981',
                  fontSize: '1.125rem',
                  fontWeight: 'bold'
                }}>
                  {day.quantity}
                </td>
                <td style={{
                  padding: '1rem',
                  textAlign: 'right',
                  color: '#a78bfa',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {day.avgPrice.toFixed(2)}
                </td>
                <td style={{
                  padding: '1rem',
                  textAlign: 'right',
                  color: '#3b82f6',
                  fontSize: '1.125rem',
                  fontWeight: 'bold'
                }}>
                  {day.total.toFixed(2)}
                </td>
                <td style={{
                  padding: '1rem',
                  textAlign: 'right',
                  color: '#f59e0b',
                  fontSize: '0.95rem',
                  fontWeight: '600'
                }}>
                  {day.count}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{
              borderTop: '2px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.1)'
            }}>
              <td colSpan="2" style={{
                padding: '1rem',
                color: '#f3f4f6',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}>
                TOTAL
              </td>
              <td style={{
                padding: '1rem',
                textAlign: 'right',
                color: '#10b981',
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>
                {dailyStats.reduce((sum, day) => sum + day.quantity, 0)}
              </td>
              <td style={{
                padding: '1rem',
                textAlign: 'right',
                color: '#a78bfa',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}>
                {(dailyStats.reduce((sum, day) => sum + day.total, 0) / dailyStats.reduce((sum, day) => sum + day.quantity, 0)).toFixed(2)}
              </td>
              <td style={{
                padding: '1rem',
                textAlign: 'right',
                color: '#3b82f6',
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>
                {dailyStats.reduce((sum, day) => sum + day.total, 0).toFixed(2)}
              </td>
              <td style={{
                padding: '1rem',
                textAlign: 'right',
                color: '#f59e0b',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}>
                {dailyStats.reduce((sum, day) => sum + day.count, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}