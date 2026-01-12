import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getBusinessStats, getPurchases, getSales } from '../services/jarsService';
import { exportPeriodPDF } from '../services/exportService';
import PeriodStatsAdvanced from '../components/PeriodStatsAdvanced';
import { 
  Package, 
  AlertTriangle,
  Sparkles
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
          <Package className="w-12 h-12 text-blue-400 mx-auto mb-4" style={{ animation: 'pulse 2s infinite' }} />
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

        {/* 1. INVENTARIO ACTUAL - PRIMERO */}
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
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #a78bfa, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                📦 Inventario Actual
              </h3>
            </div>
          </div>

          {/* Stock Actual */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Frascos en Stock
            </div>
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: currentStock === 0 ? '#ef4444' : currentStock < 20 ? '#f59e0b' : '#8b5cf6'
            }}>
              {currentStock}
            </div>
          </div>
        </div>

        {/* 2. ESTADÍSTICAS POR PERÍODO - SEGUNDO */}
        <PeriodStatsAdvanced 
          sales={sales} 
          purchases={purchases}
          onExportPDF={(periodType, data, periodLabel) => {
            exportPeriodPDF(periodType, data, periodLabel);
          }}
        />

        {/* 3. TOTALES HISTÓRICOS - TERCERO */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          padding: '2rem',
          border: '2px solid rgba(59, 130, 246, 0.3)'
        }}>
          <div className="flex items-center gap-3 mb-6">
            <div style={{
              padding: '1rem',
              borderRadius: '1rem',
              background: 'rgba(59, 130, 246, 0.2)'
            }}>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              💰 Totales Históricos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      </div>
    </div>
  );
}