import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getBusinessStats, getPurchases, getSales } from '../services/jarsService';
import { exportStatsPDF } from '../services/exportService';
import PeriodStats from '../components/PeriodStats';
import { 
  Package, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Download
} from 'lucide-react';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
    loadStats();
    loadTransactions();
  }, []);

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    const result = await getBusinessStats();
    if (result.success) {
      setStats(result.data);
    }
    setLoading(false);
  };

  const loadTransactions = async () => {
    const [salesResult, purchasesResult] = await Promise.all([
      getSales(1000),
      getPurchases(1000)
    ]);
    
    if (salesResult.success) setSales(salesResult.data || []);
    if (purchasesResult.success) setPurchases(purchasesResult.data || []);
  };

  const handleExportPDF = async () => {
    if (!stats) return;
    
    const [purchasesResult, salesResult] = await Promise.all([
      getPurchases(1000),
      getSales(1000)
    ]);
    
    const purchasesData = purchasesResult.success ? purchasesResult.data : [];
    const salesData = salesResult.success ? salesResult.data : [];
    
    // Calcular total_purchased y total_sold
    const totalPurchased = stats.current_stock + (stats.total_jars_sold || 0);
    const totalSold = stats.total_jars_sold || 0;
    
    const exportData = {
      ...stats,
      total_purchased: totalPurchased,
      total_sold: totalSold
    };
    
    exportStatsPDF(exportData, purchasesData, salesData);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #111827, #1e293b, #111827)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f3f4f6'
      }}>
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p style={{ color: '#d1d5db', fontWeight: '600' }}>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const currentStock = stats?.current_stock || 0;
  const totalPurchased = currentStock + (stats?.total_jars_sold || 0);
  const totalSold = stats?.total_jars_sold || 0;
  const isLowStock = currentStock < 50 && currentStock > 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #111827, #1e293b, #111827)',
      padding: '2rem 1rem',
      color: '#f3f4f6'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="space-y-6">
        
        {/* Bienvenida */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 20px 50px rgba(59, 130, 246, 0.3)'
        }}>
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-white" />
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff' }}>
              ¡Hola, {profile?.full_name}! 👋
            </h2>
          </div>
        </div>

        {/* Alerta Stock Vacío */}
        {currentStock === 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.2)'
          }}>
            <div className="flex gap-4">
              <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
              <div>
                <h3 style={{ fontWeight: 'bold', color: '#fca5a5', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                  ⚠️ Stock Vacío
                </h3>
                <p style={{ color: '#fecaca' }}>
                  No hay frascos disponibles. ¡Registra una compra para reponer el inventario!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alerta Stock Bajo */}
        {isLowStock && (
          <div style={{
            background: 'rgba(249, 115, 22, 0.1)',
            border: '2px solid rgba(249, 115, 22, 0.3)',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(249, 115, 22, 0.2)'
          }}>
            <div className="flex gap-4">
              <AlertTriangle className="w-8 h-8 text-orange-400 flex-shrink-0" />
              <div>
                <h3 style={{ fontWeight: 'bold', color: '#fb923c', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                  ⚠️ Stock Bajo
                </h3>
                <p style={{ color: '#fdba74' }}>
                  Solo quedan {currentStock} frascos. Considera hacer una nueva compra pronto.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas por Período */}
        <PeriodStats sales={sales} purchases={purchases} />

        {/* Card de Inventario */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          padding: '2rem',
          border: '2px solid rgba(139, 92, 246, 0.3)'
        }}>
          <div className="flex items-center gap-3 mb-6">
            <div style={{
              padding: '1rem',
              borderRadius: '1rem',
              background: 'rgba(139, 92, 246, 0.2)'
            }}>
              <Package className="w-8 h-8 text-purple-400" />
            </div>
            <h3 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: '#f9fafb',
              margin: 0
            }}>
              📦 Inventario
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stock Actual */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#d1d5db', 
                fontWeight: '500', 
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Stock Actual
              </p>
              <p style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                color: isLowStock ? '#fb923c' : currentStock === 0 ? '#ef4444' : '#a78bfa',
                marginBottom: '0.5rem',
                lineHeight: 1
              }}>
                {currentStock}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>frascos disponibles</p>
            </div>

            {/* Total Comprado */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#d1d5db', 
                fontWeight: '500', 
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Total Comprado
              </p>
              <p style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                color: '#60a5fa',
                marginBottom: '0.5rem',
                lineHeight: 1
              }}>
                {totalPurchased}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>frascos comprados</p>
            </div>

            {/* Total Vendido */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#d1d5db', 
                fontWeight: '500', 
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Total Vendido
              </p>
              <p style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                color: '#34d399',
                marginBottom: '0.5rem',
                lineHeight: 1
              }}>
                {totalSold}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>frascos vendidos</p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={loadStats}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              background: 'rgba(31, 41, 55, 0.8)',
              color: '#60a5fa',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.5 : 1
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'rgba(31, 41, 55, 0.8)')}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>

          <button
            onClick={handleExportPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>

      </div>
    </div>
  );
}