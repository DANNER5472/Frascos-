import { TrendingUp, Package, DollarSign, Calendar } from 'lucide-react';

export default function PeriodStats({ sales = [], purchases = [] }) {
  const calculatePeriodStats = (period) => {
    const now = new Date();
    let startDate;

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    }

    // Filtrar ventas del período
    const periodSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= startDate;
    });

    // Filtrar compras del período
    const periodPurchases = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.created_at);
      return purchaseDate >= startDate;
    });

    // Calcular totales de ventas
    const totalSalesQty = periodSales.reduce((sum, s) => sum + parseInt(s.quantity || 0), 0);
    const totalSalesAmount = periodSales.reduce((sum, s) => 
      sum + (parseInt(s.quantity || 0) * parseFloat(s.unit_price || 0)), 0
    );

    // Calcular totales de compras
    const totalPurchasesQty = periodPurchases.reduce((sum, p) => sum + parseInt(p.quantity || 0), 0);
    const totalPurchasesAmount = periodPurchases.reduce((sum, p) => sum + parseFloat(p.total_price || 0), 0);

    return {
      sales: {
        quantity: totalSalesQty,
        amount: totalSalesAmount
      },
      purchases: {
        quantity: totalPurchasesQty,
        amount: totalPurchasesAmount
      }
    };
  };

  const todayStats = calculatePeriodStats('today');
  const weekStats = calculatePeriodStats('week');
  const monthStats = calculatePeriodStats('month');

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const StatCard = ({ title, icon: Icon, stats, color }) => (
    <div style={{
      background: 'rgba(30, 41, 59, 0.8)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      borderRadius: isMobile ? '0.75rem' : '1rem',
      padding: isMobile ? '0.75rem' : '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '0.5rem' : '0.75rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h4 style={{
          fontSize: isMobile ? '0.75rem' : '0.875rem',
          fontWeight: '600',
          color: '#9ca3af',
          margin: 0
        }}>
          {title}
        </h4>
        <Icon style={{ 
          width: isMobile ? '16px' : '20px', 
          height: isMobile ? '16px' : '20px',
          color: color 
        }} />
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '0.3rem' : '0.5rem'
      }}>
        {/* Ventas */}
        <div>
          <div style={{
            fontSize: isMobile ? '0.65rem' : '0.75rem',
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
              fontSize: isMobile ? '0.9rem' : '1.125rem',
              fontWeight: '700',
              color: '#10b981'
            }}>
              {stats.sales.quantity}
            </span>
            <span style={{
              fontSize: isMobile ? '0.65rem' : '0.75rem',
              color: '#9ca3af'
            }}>
              frascos
            </span>
          </div>
          <div style={{
            fontSize: isMobile ? '0.7rem' : '0.875rem',
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
          margin: isMobile ? '0.125rem 0' : '0.25rem 0'
        }}></div>

        {/* Compras */}
        <div>
          <div style={{
            fontSize: isMobile ? '0.65rem' : '0.75rem',
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
              fontSize: isMobile ? '0.9rem' : '1.125rem',
              fontWeight: '700',
              color: '#3b82f6'
            }}>
              {stats.purchases.quantity}
            </span>
            <span style={{
              fontSize: isMobile ? '0.65rem' : '0.75rem',
              color: '#9ca3af'
            }}>
              frascos
            </span>
          </div>
          <div style={{
            fontSize: isMobile ? '0.7rem' : '0.875rem',
            fontWeight: '600',
            color: '#60a5fa'
          }}>
            Bs. {stats.purchases.amount.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: isMobile ? '0.75rem' : '1rem',
      marginBottom: isMobile ? '1rem' : '1.5rem'
    }}>
      <StatCard 
        title="📅 HOY"
        icon={Calendar}
        stats={todayStats}
        color="#10b981"
      />
      <StatCard 
        title="📅 ESTA SEMANA"
        icon={TrendingUp}
        stats={weekStats}
        color="#3b82f6"
      />
      <StatCard 
        title="📅 ESTE MES"
        icon={Package}
        stats={monthStats}
        color="#8b5cf6"
      />
    </div>
  );
}