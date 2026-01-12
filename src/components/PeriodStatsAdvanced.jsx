import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PeriodStatsAdvanced({ sales = [], purchases = [], onExportPDF }) {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Cerrar selectores al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;
      const isInsideSelector = target.closest('[data-selector]');
      const isButton = target.closest('button');
      
      // Solo cerrar si no estás dentro del selector y no estás clickeando el botón
      if (!isInsideSelector && !isButton) {
        setShowDayPicker(false);
        setShowMonthPicker(false);
      }
    };

    if (showDayPicker || showMonthPicker) {
      // Pequeño delay para evitar que se cierre inmediatamente
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDayPicker, showMonthPicker]);

  // Calcular estadísticas para un día específico
  const calculateDayStats = (date) => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    const daySales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= dayStart && saleDate <= dayEnd;
    });

    const dayPurchases = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.created_at);
      return purchaseDate >= dayStart && purchaseDate <= dayEnd;
    });

    return {
      sales: {
        quantity: daySales.reduce((sum, s) => sum + parseInt(s.quantity || 0), 0),
        amount: daySales.reduce((sum, s) => sum + (parseInt(s.quantity || 0) * parseFloat(s.unit_price || 0)), 0)
      },
      purchases: {
        quantity: dayPurchases.reduce((sum, p) => sum + parseInt(p.quantity || 0), 0),
        amount: dayPurchases.reduce((sum, p) => sum + parseFloat(p.total_price || 0), 0)
      },
      data: { sales: daySales, purchases: dayPurchases }
    };
  };

  // Calcular estadísticas para una semana
  const calculateWeekStats = (offset) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7 + (offset * 7));
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + (offset * 7));

    const weekSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= weekStart && saleDate <= weekEnd;
    });

    const weekPurchases = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.created_at);
      return purchaseDate >= weekStart && purchaseDate <= weekEnd;
    });

    return {
      sales: {
        quantity: weekSales.reduce((sum, s) => sum + parseInt(s.quantity || 0), 0),
        amount: weekSales.reduce((sum, s) => sum + (parseInt(s.quantity || 0) * parseFloat(s.unit_price || 0)), 0)
      },
      purchases: {
        quantity: weekPurchases.reduce((sum, p) => sum + parseInt(p.quantity || 0), 0),
        amount: weekPurchases.reduce((sum, p) => sum + parseFloat(p.total_price || 0), 0)
      },
      data: { sales: weekSales, purchases: weekPurchases }
    };
  };

  // Calcular estadísticas para un mes
  const calculateMonthStats = (date) => {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= monthStart && saleDate <= monthEnd;
    });

    const monthPurchases = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.created_at);
      return purchaseDate >= monthStart && purchaseDate <= monthEnd;
    });

    return {
      sales: {
        quantity: monthSales.reduce((sum, s) => sum + parseInt(s.quantity || 0), 0),
        amount: monthSales.reduce((sum, s) => sum + (parseInt(s.quantity || 0) * parseFloat(s.unit_price || 0)), 0)
      },
      purchases: {
        quantity: monthPurchases.reduce((sum, p) => sum + parseInt(p.quantity || 0), 0),
        amount: monthPurchases.reduce((sum, p) => sum + parseFloat(p.total_price || 0), 0)
      },
      data: { sales: monthSales, purchases: monthPurchases }
    };
  };

  const dayStats = calculateDayStats(selectedDay);
  const weekStats = calculateWeekStats(weekOffset);
  const monthStats = calculateMonthStats(selectedMonth);

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatMonth = (date) => {
    const month = date.toLocaleDateString('es-ES', { month: 'long' });
    return month.charAt(0).toUpperCase() + month.slice(1) + ' ' + date.getFullYear();
  };

  const getWeekLabel = (offset) => {
    if (offset === 0) return 'Esta Semana';
    if (offset === -1) return 'Semana Pasada';
    return `Hace ${Math.abs(offset)} semanas`;
  };

  // Generar opciones de meses
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push(date);
    }
    return options;
  };

  const StatCard = ({ title, stats, onSelectPeriod, onExport, periodLabel, showSelector, color }) => (
    <div style={{
      background: 'rgba(30, 41, 59, 0.8)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      borderRadius: isMobile ? '0.75rem' : '1rem',
      padding: isMobile ? '0.75rem' : '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '0.5rem' : '0.75rem'
    }}>
      {/* Header con selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flex: 1
        }}>
          <Calendar style={{ 
            width: isMobile ? '14px' : '16px', 
            height: isMobile ? '14px' : '16px',
            color: color,
            flexShrink: 0
          }} />
          {showSelector ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPeriod();
              }}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.375rem',
                padding: '0.25rem 0.5rem',
                color: '#60a5fa',
                fontSize: isMobile ? '0.7rem' : '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                flex: 1,
                minWidth: 0
              }}
            >
              <span style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {periodLabel}
              </span>
              <ChevronDown style={{ width: '12px', height: '12px', flexShrink: 0 }} />
            </button>
          ) : (
            <span style={{
              fontSize: isMobile ? '0.7rem' : '0.75rem',
              fontWeight: '600',
              color: '#9ca3af'
            }}>
              {periodLabel}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '0.3rem' : '0.5rem'
      }}>
        {/* Ventas */}
        <div>
          <div style={{
            fontSize: isMobile ? '0.65rem' : '0.7rem',
            color: '#6b7280',
            marginBottom: '0.125rem'
          }}>
            💰 Ventas
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.5rem'
          }}>
            <span style={{
              fontSize: isMobile ? '0.95rem' : '1.125rem',
              fontWeight: '700',
              color: '#10b981'
            }}>
              {stats.sales.quantity}
            </span>
            <span style={{
              fontSize: isMobile ? '0.65rem' : '0.7rem',
              color: '#9ca3af'
            }}>
              frascos
            </span>
          </div>
          <div style={{
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            fontWeight: '600',
            color: '#34d399'
          }}>
            Bs. {stats.sales.amount.toFixed(2)}
          </div>
        </div>

        {/* Separador */}
        <div style={{
          height: '1px',
          background: 'rgba(148, 163, 184, 0.1)',
          margin: '0.125rem 0'
        }}></div>

        {/* Compras */}
        <div>
          <div style={{
            fontSize: isMobile ? '0.65rem' : '0.7rem',
            color: '#6b7280',
            marginBottom: '0.125rem'
          }}>
            📦 Compras
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.5rem'
          }}>
            <span style={{
              fontSize: isMobile ? '0.95rem' : '1.125rem',
              fontWeight: '700',
              color: '#3b82f6'
            }}>
              {stats.purchases.quantity}
            </span>
            <span style={{
              fontSize: isMobile ? '0.65rem' : '0.7rem',
              color: '#9ca3af'
            }}>
              frascos
            </span>
          </div>
          <div style={{
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            fontWeight: '600',
            color: '#60a5fa'
          }}>
            Bs. {stats.purchases.amount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Botón PDF */}
      <button
        onClick={() => onExport(stats.data)}
        disabled={stats.sales.quantity === 0 && stats.purchases.quantity === 0}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          padding: isMobile ? '0.5rem' : '0.6rem',
          borderRadius: '0.5rem',
          border: 'none',
          background: (stats.sales.quantity === 0 && stats.purchases.quantity === 0)
            ? 'rgba(31, 41, 55, 0.5)'
            : `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          color: '#ffffff',
          fontSize: isMobile ? '0.7rem' : '0.75rem',
          fontWeight: '600',
          cursor: (stats.sales.quantity === 0 && stats.purchases.quantity === 0) ? 'not-allowed' : 'pointer',
          opacity: (stats.sales.quantity === 0 && stats.purchases.quantity === 0) ? 0.5 : 1,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          if (stats.sales.quantity > 0 || stats.purchases.quantity > 0) {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <Download style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px' }} />
        PDF {title}
      </button>
    </div>
  );

  return (
    <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? '0.75rem' : '1rem'
      }}>
        {/* DÍA */}
        <div style={{ position: 'relative' }}>
          <StatCard
            title="Día"
            stats={dayStats}
            periodLabel={formatDate(selectedDay)}
            showSelector={true}
            onSelectPeriod={() => setShowDayPicker(!showDayPicker)}
            onExport={(data) => onExportPDF('day', data, formatDate(selectedDay))}
            color="#10b981"
          />
          {/* Selector de día */}
          {showDayPicker && (
            <div 
              data-selector
              onClick={(e) => e.stopPropagation()}
              style={{
              position: 'absolute',
              top: isMobile ? '3.5rem' : '4rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: 'rgba(30, 41, 59, 0.98)',
              border: '2px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '0.75rem',
              padding: '1rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <input
                type="date"
                value={selectedDay.toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedDay(new Date(e.target.value + 'T12:00:00'));
                  setShowDayPicker(false);
                }}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* SEMANA */}
        <div style={{ position: 'relative' }}>
          <StatCard
            title="Semana"
            stats={weekStats}
            periodLabel={getWeekLabel(weekOffset)}
            showSelector={true}
            onSelectPeriod={() => {}}
            onExport={(data) => onExportPDF('week', data, getWeekLabel(weekOffset))}
            color="#3b82f6"
          />
          {/* Flechas para navegar semanas */}
          <div style={{
            position: 'absolute',
            top: isMobile ? '0.75rem' : '1rem',
            right: isMobile ? '0.75rem' : '1rem',
            display: 'flex',
            gap: '0.25rem'
          }}>
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.25rem',
                padding: '0.125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#60a5fa'
              }}
            >
              <ChevronLeft style={{ width: '12px', height: '12px' }} />
            </button>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              disabled={weekOffset >= 0}
              style={{
                background: weekOffset >= 0 ? 'rgba(31, 41, 55, 0.5)' : 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.25rem',
                padding: '0.125rem',
                cursor: weekOffset >= 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: weekOffset >= 0 ? '#6b7280' : '#60a5fa',
                opacity: weekOffset >= 0 ? 0.5 : 1
              }}
            >
              <ChevronRight style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
        </div>

        {/* MES */}
        <div style={{ position: 'relative' }}>
          <StatCard
            title="Mes"
            stats={monthStats}
            periodLabel={formatMonth(selectedMonth)}
            showSelector={true}
            onSelectPeriod={() => setShowMonthPicker(!showMonthPicker)}
            onExport={(data) => onExportPDF('month', data, formatMonth(selectedMonth))}
            color="#8b5cf6"
          />
          {/* Selector de mes */}
          {showMonthPicker && (
            <div 
              data-selector
              onClick={(e) => e.stopPropagation()}
              style={{
              position: 'absolute',
              top: isMobile ? '3.5rem' : '4rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: 'rgba(30, 41, 59, 0.98)',
              border: '2px solid rgba(139, 92, 246, 0.5)',
              borderRadius: '0.75rem',
              padding: '0.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              maxHeight: '300px',
              overflowY: 'auto',
              minWidth: '180px'
            }}>
              {getMonthOptions().map((date, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedMonth(date);
                    setShowMonthPicker(false);
                  }}
                  style={{
                    padding: '0.6rem 0.8rem',
                    cursor: 'pointer',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#fff',
                    background: date.getMonth() === selectedMonth.getMonth() && 
                               date.getFullYear() === selectedMonth.getFullYear() 
                               ? 'rgba(139, 92, 246, 0.3)' 
                               : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!(date.getMonth() === selectedMonth.getMonth() && 
                          date.getFullYear() === selectedMonth.getFullYear())) {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(date.getMonth() === selectedMonth.getMonth() && 
                          date.getFullYear() === selectedMonth.getFullYear())) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {formatMonth(date)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}