import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { getPurchases, getSales } from '../services/jarsService';

export default function TodayStats() {
  const [stats, setStats] = useState({
    todayPurchases: 0,
    todayPurchasesAmount: 0,
    todaySales: 0,
    todaySalesAmount: 0,
    todayProfit: 0,
    yesterdayPurchases: 0,
    yesterdayPurchasesAmount: 0,
    yesterdaySales: 0,
    yesterdaySalesAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayStats();
  }, []);

  const loadTodayStats = async () => {
    setLoading(true);
    
    try {
      const [purchasesResult, salesResult] = await Promise.all([
        getPurchases(100),
        getSales(100)
      ]);

      const purchases = purchasesResult.success ? purchasesResult.data : [];
      const sales = salesResult.success ? salesResult.data : [];

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(yesterday);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);

      // Estadísticas de HOY
      const todayPurchases = purchases.filter(p => {
        const date = new Date(p.created_at);
        return date >= today;
      });

      const todaySales = sales.filter(s => {
        const date = new Date(s.created_at);
        return date >= today;
      });

      // Estadísticas de AYER
      const yesterdayPurchases = purchases.filter(p => {
        const date = new Date(p.created_at);
        return date >= yesterday && date < today;
      });

      const yesterdaySales = sales.filter(s => {
        const date = new Date(s.created_at);
        return date >= yesterday && date < today;
      });

      const todayPurchasesQty = todayPurchases.reduce((sum, p) => sum + p.quantity, 0);
      const todayPurchasesAmt = todayPurchases.reduce((sum, p) => sum + parseFloat(p.total_price), 0);
      const todaySalesQty = todaySales.reduce((sum, s) => sum + s.quantity, 0);
      const todaySalesAmt = todaySales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);
      
      const yesterdayPurchasesQty = yesterdayPurchases.reduce((sum, p) => sum + p.quantity, 0);
      const yesterdayPurchasesAmt = yesterdayPurchases.reduce((sum, p) => sum + parseFloat(p.total_price), 0);
      const yesterdaySalesQty = yesterdaySales.reduce((sum, s) => sum + s.quantity, 0);
      const yesterdaySalesAmt = yesterdaySales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

      setStats({
        todayPurchases: todayPurchasesQty,
        todayPurchasesAmount: todayPurchasesAmt,
        todaySales: todaySalesQty,
        todaySalesAmount: todaySalesAmt,
        todayProfit: todaySalesAmt - todayPurchasesAmt,
        yesterdayPurchases: yesterdayPurchasesQty,
        yesterdayPurchasesAmount: yesterdayPurchasesAmt,
        yesterdaySales: yesterdaySalesQty,
        yesterdaySalesAmount: yesterdaySalesAmt
      });
    } catch (error) {
      console.error('Error loading today stats:', error);
    }
    
    setLoading(false);
  };

  const calculateChange = (today, yesterday) => {
    if (yesterday === 0) return today > 0 ? 100 : 0;
    return (((today - yesterday) / yesterday) * 100).toFixed(1);
  };

  const purchasesChange = calculateChange(stats.todayPurchasesAmount, stats.yesterdayPurchasesAmount);
  const salesChange = calculateChange(stats.todaySalesAmount, stats.yesterdaySalesAmount);
  const profitChange = calculateChange(stats.todayProfit, stats.yesterdaySalesAmount - stats.yesterdayPurchasesAmount);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: 'rgba(31, 41, 55, 0.9)',
            borderRadius: '1.5rem',
            padding: '1.5rem',
            border: '2px solid rgba(55, 65, 81, 0.5)',
            minHeight: '140px'
          }} className="animate-pulse">
            <div style={{ width: '60%', height: '20px', background: '#374151', borderRadius: '0.5rem', marginBottom: '1rem' }} />
            <div style={{ width: '40%', height: '32px', background: '#374151', borderRadius: '0.5rem' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#f9fafb',
        marginBottom: '1rem'
      }}>
        📅 Estadísticas de Hoy
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Compras Hoy */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div className="flex items-center justify-between mb-3">
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              padding: '0.75rem',
              borderRadius: '1rem'
            }}>
              <Package className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex items-center gap-1">
              {parseFloat(purchasesChange) >= 0 ? (
                <TrendingUp style={{ width: '16px', height: '16px', color: '#34d399' }} />
              ) : (
                <TrendingDown style={{ width: '16px', height: '16px', color: '#f87171' }} />
              )}
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: parseFloat(purchasesChange) >= 0 ? '#34d399' : '#f87171'
              }}>
                {purchasesChange > 0 ? '+' : ''}{purchasesChange}%
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#93c5fd', fontWeight: '600', marginBottom: '0.5rem' }}>
            Compras Hoy
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa', marginBottom: '0.25rem' }}>
            {stats.todayPurchases}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#93c5fd' }}>
            frascos
          </p>
          <div style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#93c5fd' }}>
              Total: <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>Bs. {stats.todayPurchasesAmount.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Ventas Hoy */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          border: '2px solid rgba(16, 185, 129, 0.3)',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div className="flex items-center justify-between mb-3">
            <div style={{
              background: 'rgba(16, 185, 129, 0.2)',
              padding: '0.75rem',
              borderRadius: '1rem'
            }}>
              <ShoppingCart className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex items-center gap-1">
              {parseFloat(salesChange) >= 0 ? (
                <TrendingUp style={{ width: '16px', height: '16px', color: '#34d399' }} />
              ) : (
                <TrendingDown style={{ width: '16px', height: '16px', color: '#f87171' }} />
              )}
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: parseFloat(salesChange) >= 0 ? '#34d399' : '#f87171'
              }}>
                {salesChange > 0 ? '+' : ''}{salesChange}%
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#6ee7b7', fontWeight: '600', marginBottom: '0.5rem' }}>
            Ventas Hoy
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#34d399', marginBottom: '0.25rem' }}>
            {stats.todaySales}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6ee7b7' }}>
            frascos
          </p>
          <div style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#6ee7b7' }}>
              Total: <span style={{ fontWeight: 'bold', color: '#34d399' }}>Bs. {stats.todaySalesAmount.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Ganancia Hoy */}
        <div style={{
          background: stats.todayProfit >= 0 
            ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          border: stats.todayProfit >= 0 ? '2px solid rgba(234, 179, 8, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = stats.todayProfit >= 0 
            ? '0 20px 40px rgba(234, 179, 8, 0.2)'
            : '0 20px 40px rgba(239, 68, 68, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div className="flex items-center justify-between mb-3">
            <div style={{
              background: stats.todayProfit >= 0 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              padding: '0.75rem',
              borderRadius: '1rem'
            }}>
              <DollarSign className={`w-6 h-6 ${stats.todayProfit >= 0 ? 'text-yellow-400' : 'text-red-400'}`} />
            </div>
            <div className="flex items-center gap-1">
              {parseFloat(profitChange) >= 0 ? (
                <TrendingUp style={{ width: '16px', height: '16px', color: '#34d399' }} />
              ) : (
                <TrendingDown style={{ width: '16px', height: '16px', color: '#f87171' }} />
              )}
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: parseFloat(profitChange) >= 0 ? '#34d399' : '#f87171'
              }}>
                {profitChange > 0 ? '+' : ''}{profitChange}%
              </span>
            </div>
          </div>

          <p style={{ 
            fontSize: '0.875rem', 
            color: stats.todayProfit >= 0 ? '#fde047' : '#fca5a5', 
            fontWeight: '600', 
            marginBottom: '0.5rem' 
          }}>
            Ganancia Hoy
          </p>
          <p style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: stats.todayProfit >= 0 ? '#facc15' : '#f87171',
            marginBottom: '0.25rem' 
          }}>
            Bs. {stats.todayProfit.toFixed(2)}
          </p>
          <p style={{ fontSize: '0.875rem', color: stats.todayProfit >= 0 ? '#fde047' : '#fca5a5' }}>
            {stats.todayProfit >= 0 ? 'positiva' : 'negativa'}
          </p>
          <div style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: `1px solid ${stats.todayProfit >= 0 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}>
            <p style={{ fontSize: '0.75rem', color: stats.todayProfit >= 0 ? '#fde047' : '#fca5a5' }}>
              vs ayer {parseFloat(profitChange) >= 0 ? '📈' : '📉'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}