import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { getPurchases, getSales } from '../services/jarsService';

export default function SalesChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // 'day' o 'month'

  useEffect(() => {
    loadChartData();
  }, [viewMode]);

  const loadChartData = async () => {
    setLoading(true);
    
    try {
      const [purchasesResult, salesResult] = await Promise.all([
        getPurchases(1000),
        getSales(1000)
      ]);

      const purchases = purchasesResult.success ? purchasesResult.data : [];
      const sales = salesResult.success ? salesResult.data : [];

      if (viewMode === 'day') {
        // Agrupar por día (últimos 30 días)
        const daysData = {};
        const now = new Date();
        
        // Inicializar últimos 30 días
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dayKey = date.toISOString().split('T')[0];
          daysData[dayKey] = {
            day: dayKey,
            compras: 0,
            ventas: 0,
            comprasTotal: 0,
            ventasTotal: 0
          };
        }
        
        // Procesar compras
        purchases.forEach(p => {
          const date = new Date(p.created_at);
          const dayKey = date.toISOString().split('T')[0];
          
          if (daysData[dayKey]) {
            daysData[dayKey].compras += p.quantity;
            daysData[dayKey].comprasTotal += parseFloat(p.total_price);
          }
        });

        // Procesar ventas
        sales.forEach(s => {
          const date = new Date(s.created_at);
          const dayKey = date.toISOString().split('T')[0];
          
          if (daysData[dayKey]) {
            daysData[dayKey].ventas += s.quantity;
            daysData[dayKey].ventasTotal += parseFloat(s.total_amount);
          }
        });

        const dataArray = Object.values(daysData).map(item => ({
          ...item,
          dayLabel: formatDayLabel(item.day)
        }));

        setChartData(dataArray);
      } else {
        // Agrupar por mes
        const monthsData = {};
        
        purchases.forEach(p => {
          const date = new Date(p.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthsData[monthKey]) {
            monthsData[monthKey] = {
              month: monthKey,
              compras: 0,
              ventas: 0,
              comprasTotal: 0,
              ventasTotal: 0
            };
          }
          
          monthsData[monthKey].compras += p.quantity;
          monthsData[monthKey].comprasTotal += parseFloat(p.total_price);
        });

        sales.forEach(s => {
          const date = new Date(s.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthsData[monthKey]) {
            monthsData[monthKey] = {
              month: monthKey,
              compras: 0,
              ventas: 0,
              comprasTotal: 0,
              ventasTotal: 0
            };
          }
          
          monthsData[monthKey].ventas += s.quantity;
          monthsData[monthKey].ventasTotal += parseFloat(s.total_amount);
        });

        const dataArray = Object.values(monthsData)
          .sort((a, b) => a.month.localeCompare(b.month))
          .map(item => ({
            ...item,
            monthLabel: formatMonthLabel(item.month)
          }));

        setChartData(dataArray);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
    
    setLoading(false);
  };

  const formatDayLabel = (dayKey) => {
    const date = new Date(dayKey);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  };

  const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div style={{
        background: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(55, 65, 81, 0.5)',
        borderRadius: '1rem',
        padding: '1rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
      }}>
        <p style={{ color: '#f9fafb', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          {payload[0].payload.monthLabel}
        </p>
        {payload.map((entry, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginTop: '0.25rem'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: entry.color
            }} />
            <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
              {entry.name}: <strong style={{ color: entry.color }}>{entry.value}</strong> frascos
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(31, 41, 55, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1.5rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        padding: '2rem',
        border: '2px solid rgba(139, 92, 246, 0.3)',
        textAlign: 'center'
      }}>
        <BarChart3 className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
        <p style={{ color: '#9ca3af' }}>Cargando gráfico...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={{
        background: 'rgba(31, 41, 55, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1.5rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        padding: '2rem',
        border: '2px solid rgba(139, 92, 246, 0.3)',
        textAlign: 'center'
      }}>
        <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p style={{ color: '#9ca3af' }}>No hay datos suficientes para el gráfico</p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Registra compras y ventas para ver las tendencias
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(31, 41, 55, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1.5rem',
      boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
      padding: '2rem',
      border: '2px solid rgba(139, 92, 246, 0.3)'
    }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-purple-400" />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f9fafb' }}>
            Tendencias de Ventas vs Compras
          </h3>
        </div>

        {/* Tabs de vista */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '0.25rem',
          borderRadius: '0.75rem',
          border: '1px solid #374151'
        }}>
          <button
            onClick={() => setViewMode('day')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              background: viewMode === 'day' ? '#8b5cf6' : 'transparent',
              color: viewMode === 'day' ? '#ffffff' : '#9ca3af',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Calendar className="w-4 h-4" />
            Por Día
          </button>
          <button
            onClick={() => setViewMode('month')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              background: viewMode === 'month' ? '#8b5cf6' : 'transparent',
              color: viewMode === 'month' ? '#ffffff' : '#9ca3af',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <BarChart3 className="w-4 h-4" />
            Por Mes
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(55, 65, 81, 0.5)"
            vertical={false}
          />
          
          <XAxis 
            dataKey={viewMode === 'day' ? 'dayLabel' : 'monthLabel'}
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(55, 65, 81, 0.5)' }}
            angle={viewMode === 'day' ? -45 : 0}
            textAnchor={viewMode === 'day' ? 'end' : 'middle'}
            height={viewMode === 'day' ? 60 : 30}
          />
          
          <YAxis 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(55, 65, 81, 0.5)' }}
            label={{ 
              value: 'Frascos', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#9ca3af', fontSize: 12 }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              color: '#d1d5db'
            }}
            iconType="line"
          />
          
          <Line 
            type="monotone" 
            dataKey="compras" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="Compras"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8, fill: '#3b82f6' }}
            fill="url(#colorCompras)"
          />
          
          <Line 
            type="monotone" 
            dataKey="ventas" 
            stroke="#10b981" 
            strokeWidth={3}
            name="Ventas"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8, fill: '#10b981' }}
            fill="url(#colorVentas)"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '1rem',
          padding: '1rem',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <p style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: '600', marginBottom: '0.25rem' }}>
            Total Comprado
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa' }}>
            {chartData.reduce((sum, d) => sum + d.compras, 0)} frascos
          </p>
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '1rem',
          padding: '1rem',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <p style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: '600', marginBottom: '0.25rem' }}>
            Total Vendido
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#34d399' }}>
            {chartData.reduce((sum, d) => sum + d.ventas, 0)} frascos
          </p>
        </div>
      </div>
    </div>
  );
}