import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { History as HistoryIcon, RefreshCw, Calendar, Package, ShoppingCart, DollarSign, Filter, Search } from 'lucide-react';

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (purchasesError) console.error('Error loading purchases:', purchasesError);

      const { data: sales, error: salesError } = await supabase
        .from('jar_sales')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (salesError) console.error('Error loading sales:', salesError);

      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (expensesError) console.error('Error loading expenses:', expensesError);

      const purchasesFormatted = (purchases || []).map(p => ({
        ...p,
        type: 'purchase',
        amount: p.total_price,
        display: `Compra: ${p.quantity} frascos`,
        searchText: `compra ${p.quantity} frascos ${p.notes || ''}`
      }));

      const salesFormatted = (sales || []).map(s => ({
        ...s,
        type: 'sale',
        amount: s.total_amount,
        display: `Venta: ${s.quantity} frascos`,
        searchText: `venta ${s.quantity} frascos ${s.notes || ''}`
      }));

      const expensesFormatted = (expenses || []).map(e => ({
        ...e,
        type: 'expense',
        display: e.description,
        searchText: `gasto ${e.description} ${e.notes || ''}`
      }));

      const all = [
        ...purchasesFormatted,
        ...salesFormatted,
        ...expensesFormatted
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setTransactions(all);
      setFilteredTransactions(all);
    } catch (error) {
      console.error('Error general:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, dateFilter, searchTerm, transactions]);

  const applyFilters = () => {
    let filtered = transactions;

    // Filtro por tipo
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter);
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.created_at);
        
        switch(dateFilter) {
          case 'today':
            return transactionDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return transactionDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return transactionDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Búsqueda por texto
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.searchText.toLowerCase().includes(search)
      );
    }

    setFilteredTransactions(filtered);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase': return Package;
      case 'sale': return ShoppingCart;
      case 'expense': return DollarSign;
      default: return HistoryIcon;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'purchase': return '📥 COMPRA';
      case 'sale': return '📤 VENTA';
      case 'expense': return '💸 GASTO';
      default: return 'TRANSACCIÓN';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'purchase': return { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.3)', text: '#60a5fa' };
      case 'sale': return { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.3)', text: '#34d399' };
      case 'expense': return { bg: 'rgba(249, 115, 22, 0.2)', border: 'rgba(249, 115, 22, 0.3)', text: '#fb923c' };
      default: return { bg: 'rgba(107, 114, 128, 0.2)', border: 'rgba(107, 114, 128, 0.3)', text: '#9ca3af' };
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #111827, #1e293b, #111827)',
      padding: '2rem 1rem',
      color: '#f3f4f6'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="space-y-6">
        {/* Encabezado */}
        <div className="flex items-center gap-4">
          <div style={{
            background: 'linear-gradient(to bottom right, #8b5cf6, #7c3aed)',
            padding: '1rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)'
          }}>
            <HistoryIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#f9fafb',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              Historial
            </h2>
            <p style={{ color: '#c4b5fd', marginTop: '0.25rem', fontWeight: '700' }}>
              {filteredTransactions.length} de {transactions.length} 
            </p>
          </div>
        </div>

        {/* Búsqueda */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          border: '1px solid rgba(55, 65, 81, 0.5)'
        }}>
          <div style={{ position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descripción o notas..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '2px solid #374151',
                borderRadius: '1rem',
                background: '#1f2937',
                color: '#f3f4f6',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#374151'}
            />
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          border: '1px solid rgba(55, 65, 81, 0.5)'
        }}>
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-6 h-6 text-purple-400" />
            <span style={{ fontWeight: 'bold', color: '#f9fafb', fontSize: '1.125rem' }}>Filtros</span>
          </div>
          
          {/* Filtro por tipo */}
          <div className="mb-4">
            <p style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.5rem', fontWeight: '600' }}>Por tipo:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
              {[
                { value: 'all', label: `Todas (${transactions.length})` },
                { value: 'purchase', label: `📥 Compras (${transactions.filter(t => t.type === 'purchase').length})` },
                { value: 'sale', label: `📤 Ventas (${transactions.filter(t => t.type === 'sale').length})` },
                { value: 'expense', label: `💸 Gastos (${transactions.filter(t => t.type === 'expense').length})` }
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    background: filter === f.value ? '#8b5cf6' : 'rgba(55, 65, 81, 0.5)',
                    color: filter === f.value ? '#ffffff' : '#9ca3af',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por fecha */}
          <div>
            <p style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.5rem', fontWeight: '600' }}>Por fecha:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
              {[
                { value: 'all', label: 'Todas' },
                { value: 'today', label: 'Hoy' },
                { value: 'week', label: '7 días' },
                { value: 'month', label: '30 días' }
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setDateFilter(f.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    background: dateFilter === f.value ? '#8b5cf6' : 'rgba(55, 65, 81, 0.5)',
                    color: dateFilter === f.value ? '#ffffff' : '#9ca3af',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botón actualizar */}
        <button
          onClick={loadTransactions}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem',
            borderRadius: '1rem',
            background: 'rgba(31, 41, 55, 0.9)',
            color: '#c4b5fd',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(31, 41, 55, 0.9)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
          }}
        >
          <RefreshCw className="w-5 h-5" />
          <span>Actualizar Historial</span>
        </button>

        {/* Lista de transacciones */}
        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p style={{ color: '#9ca3af', fontSize: '1.125rem', fontWeight: '600' }}>Cargando historial...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{
            background: 'rgba(31, 41, 55, 0.8)',
            borderRadius: '1.5rem',
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '1px solid #374151'
          }}>
            <HistoryIcon className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <p style={{ color: '#9ca3af', fontSize: '1.125rem', fontWeight: '600' }}>
              {searchTerm ? 'No se encontraron resultados' : 'No hay transacciones en este período'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#8b5cf6',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type);
              const colors = getTypeColor(transaction.type);

              return (
                <div
                  key={`${transaction.type}-${transaction.id}`}
                  style={{
                    background: 'rgba(31, 41, 55, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1.5rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    padding: '1.5rem',
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div style={{
                      background: colors.bg,
                      padding: '0.75rem',
                      borderRadius: '1rem'
                    }}>
                      <Icon style={{ width: '24px', height: '24px', color: colors.text }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          color: colors.text,
                          letterSpacing: '0.05em'
                        }}>
                          {getTypeLabel(transaction.type)}
                        </span>
                        <span style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: colors.text
                        }}>
                          Bs. {parseFloat(transaction.amount).toFixed(2)}
                        </span>
                      </div>
                      <p style={{
                        fontWeight: 'bold',
                        fontSize: '1.125rem',
                        color: '#f9fafb',
                        marginBottom: '0.5rem'
                      }}>
                        {transaction.display}
                      </p>
                      
                      {transaction.type === 'purchase' && (
                        <p style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '600' }}>Costo unitario:</span> Bs. {parseFloat(transaction.unit_cost).toFixed(2)}
                        </p>
                      )}
                      
                      {transaction.type === 'sale' && (
                        <p style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '600' }}>Precio unitario:</span> Bs. {parseFloat(transaction.unit_price).toFixed(2)}
                        </p>
                      )}
                      
                      {transaction.notes && (
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#d1d5db',
                          fontStyle: 'italic',
                          background: 'rgba(55, 65, 81, 0.3)',
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          marginTop: '0.5rem'
                        }}>
                          "{transaction.notes}"
                        </p>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.75rem',
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        fontWeight: '600'
                      }}>
                        <Calendar className="w-4 h-4" />
                        {formatDate(transaction.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}