import { useState, useEffect } from 'react';
import { addSale, getSales, deleteSale, updateSale, getBusinessStats } from '../services/jarsService';
import { exportSalesPDF } from '../services/exportService';
import { supabase } from '../services/supabase';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import EditSaleModal from '../components/EditSaleModal';
import SalesByDay from '../components/SalesByDay';
import DateSearch from '../components/DateSearch';
import useToast from '../hooks/useToast';
import { ShoppingCart, Plus, Trash2, Edit, RefreshCw, Calendar, AlertCircle, TrendingUp, Download } from 'lucide-react';

export default function Sales() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [currentStock, setCurrentStock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [specificDate, setSpecificDate] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [editModal, setEditModal] = useState({ isOpen: false, sale: null });
  const { toast, showSuccess, showError, hideToast } = useToast();

  const totalAmount = quantity && unitPrice ? (parseInt(quantity) * parseFloat(unitPrice)).toFixed(2) : '0.00';

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

  useEffect(() => {
    checkAdmin();
    loadSales();
    loadStock();
  }, []);

  useEffect(() => {
    filterSalesByDate();
  }, [dateFilter, sales, specificDate]);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setIsAdmin(data?.role === 'admin');
    }
  };

  const loadSales = async () => {
    setLoadingList(true);
    const result = await getSales();
    if (result.success) {
      setSales(result.data);
      // Forzar actualización inmediata del filtro
      applyFilter(result.data, dateFilter);
    }
    setLoadingList(false);
  };

  const applyFilter = (salesData, filter) => {
    if (!salesData || salesData.length === 0) {
      setFilteredSales([]);
      return;
    }

    // Si hay fecha específica seleccionada, filtrar por esa fecha
    if (specificDate) {
      const selectedDate = new Date(specificDate + 'T00:00:00');
      const filtered = salesData.filter(sale => {
        const saleDate = new Date(sale.created_at);
        const saleDateOnly = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());
        const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        return saleDateOnly.getTime() === selectedDateOnly.getTime();
      });
      setFilteredSales(filtered);
      return;
    }

    if (filter === 'all') {
      setFilteredSales(salesData);
      return;
    }

    const now = new Date();
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const filtered = salesData.filter(sale => {
      const saleDate = new Date(sale.created_at);
      const saleDateOnly = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());
      
      switch(filter) {
        case 'today':
          return saleDateOnly.getTime() === nowDateOnly.getTime();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return saleDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return saleDate >= monthAgo;
        default:
          return true;
      }
    });
    
    setFilteredSales(filtered);
  };

  const loadStock = async () => {
    const result = await getBusinessStats();
    if (result.success) {
      setCurrentStock(result.data.current_stock || 0);
    }
  };

  const filterSalesByDate = () => {
    applyFilter(sales, dateFilter);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!quantity || !unitPrice) {
      showError('Completa todos los campos requeridos');
      setLoading(false);
      return;
    }

    if (parseInt(quantity) <= 0 || parseFloat(unitPrice) <= 0) {
      showError('La cantidad y el precio deben ser mayores a 0');
      setLoading(false);
      return;
    }

    if (parseInt(quantity) > currentStock) {
      showError(`Stock insuficiente. Solo tienes ${currentStock} frascos disponibles.`);
      setLoading(false);
      return;
    }

    const totalAmount = (parseInt(quantity) * parseFloat(unitPrice)).toFixed(2);
    const result = await addSale(
      parseInt(quantity),
      parseFloat(unitPrice),
      notes
    );

    if (result.success) {
      showSuccess(`Venta registrada: ${quantity} frascos por Bs. ${totalAmount}`);
      setQuantity('');
      setUnitPrice('');
      setNotes('');
      loadSales();
      loadStock();
    } else {
      showError(result.error || 'Error al registrar la venta');
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    const result = await deleteSale(id);
    if (result.success) {
      loadSales();
      loadStock();
      showSuccess('Venta eliminada correctamente');
    } else {
      showError(result.error || 'Error al eliminar la venta');
    }
  };

  const openDeleteModal = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null });
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      handleDelete(deleteModal.id);
    }
  };

  const openEditModal = (sale) => {
    setEditModal({ isOpen: true, sale });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, sale: null });
  };

  const handleEdit = async (updatedData) => {
    const result = await updateSale(
      updatedData.id,
      updatedData.quantity,
      updatedData.unit_price,
      updatedData.notes
    );

    if (result.success) {
      loadSales();
      loadStock();
      showSuccess('Venta actualizada correctamente');
      return true;
    } else {
      showError(result.error || 'Error al actualizar la venta');
      return false;
    }
  };

  const handleExportPDF = () => {
    try {
      if (filteredSales.length === 0) {
        alert('No hay ventas para exportar');
        return;
      }
      console.log('Exportando', filteredSales.length, 'ventas...');
      exportSalesPDF(filteredSales);
      console.log('PDF exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al exportar PDF: ' + error.message);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #374151',
    borderRadius: '1rem',
    background: '#1f2937',
    color: '#f3f4f6',
    fontSize: '1.125rem',
    outline: 'none',
    transition: 'all 0.2s'
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
            background: 'linear-gradient(to bottom right, #10b981, #059669)',
            padding: '1rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
          }}>
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#f9fafb',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              Registrar Venta
            </h2>
            <p style={{ color: '#10b981', marginTop: '0.25rem', fontWeight: '700' }}>
              Stock disponible: {currentStock} frascos
            </p>
          </div>
        </div>

        {/* Alerta sin stock */}
        {currentStock === 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '1rem',
            padding: '1.5rem'
          }}>
            <div className="flex gap-4">
              <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
              <div>
                <h3 style={{ fontWeight: 'bold', color: '#fca5a5', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                  Sin stock disponible
                </h3>
                <p style={{ color: '#f87171' }}>
                  No puedes registrar ventas sin frascos en inventario. Ve a "Compras" para agregar stock.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div style={{
          background: 'rgba(31, 41, 55, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          padding: '2rem',
          border: '1px solid rgba(55, 65, 81, 0.5)'
        }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  type="text"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir solo números enteros
                    if (value === '' || /^\d+$/.test(value)) {
                      setQuantity(value);
                    }
                  }}
                  style={inputStyle}
                  placeholder="10"
                  disabled={loading || currentStock === 0}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                  Máximo: {currentStock} frascos
                </p>
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
                  type="text"
                  inputMode="decimal"
                  value={unitPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir solo números y un punto decimal
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setUnitPrice(value);
                    }
                  }}
                  style={inputStyle}
                  placeholder="8.00"
                  disabled={loading || currentStock === 0}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>
            </div>

            {quantity && unitPrice && (
              <div style={{
                background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                border: '2px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '1rem',
                padding: '1.5rem'
              }}>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6ee7b7' }}>
                    Total de la Venta
                  </p>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#34d399', marginBottom: '0.5rem' }}>
                  Bs. {totalAmount}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>
                  Stock después de venta: {currentStock - parseInt(quantity || 0)} frascos
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
                style={{...inputStyle, fontFamily: 'inherit'}}
                placeholder="Ej: Venta al cliente María"
                rows="3"
                disabled={loading || currentStock === 0}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#374151'}
              />
            </div>

            <button
              type="submit"
              disabled={loading || currentStock === 0}
              className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  Registrar Venta
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tabla de Ventas por Día */}
        <SalesByDay sales={sales} />

        {/* Historial */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f9fafb' }}>
              Historial de Ventas
            </h3>
            
            <div className="flex items-center gap-3">
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                background: 'rgba(31, 41, 55, 0.8)',
                padding: '0.25rem',
                borderRadius: '0.75rem',
                border: '1px solid #374151'
              }}>
                {[
                  { value: 'all', label: 'Todas' },
                  { value: 'today', label: 'Hoy' },
                  { value: 'week', label: '7 días' },
                  { value: 'month', label: '30 días' }
                ].map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setDateFilter(filter.value);
                      setSpecificDate(''); // Limpiar fecha específica
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      background: dateFilter === filter.value ? '#10b981' : 'transparent',
                      color: dateFilter === filter.value ? '#ffffff' : '#9ca3af',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <DateSearch 
                onDateSelect={(date) => {
                  setSpecificDate(date);
                  setDateFilter('all');
                }}
                selectedDate={specificDate}
                onClear={() => {
                  setSpecificDate('');
                  applyFilter(sales, dateFilter);
                }}
              />

              <button
                onClick={handleExportPDF}
                disabled={filteredSales.length === 0}
                style={{
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500',
                  background: 'transparent',
                  border: 'none',
                  cursor: filteredSales.length === 0 ? 'not-allowed' : 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s',
                  opacity: filteredSales.length === 0 ? 0.5 : 1
                }}
                onMouseEnter={(e) => filteredSales.length > 0 && (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)')}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Download className="w-5 h-5" />
                Exportar PDF
              </button>

              <button
                onClick={() => { loadSales(); loadStock(); }}
                style={{
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <RefreshCw className="w-5 h-5" />
                Actualizar
              </button>
            </div>
          </div>

          {loadingList ? (
            <div className="text-center py-12">
              <RefreshCw className="w-10 h-10 text-green-400 animate-spin mx-auto mb-3" />
              <p style={{ color: '#9ca3af' }}>Cargando ventas...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div style={{
              background: 'rgba(31, 41, 55, 0.8)',
              borderRadius: '1.5rem',
              padding: '3rem',
              textAlign: 'center',
              border: '1px solid #374151'
            }}>
              <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                {dateFilter === 'all' ? 'No hay ventas registradas' : 'No hay ventas en este período'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSales.map((sale) => (
                <div
                  key={sale.id}
                  style={{
                    background: 'rgba(31, 41, 55, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1.5rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    padding: '1.5rem',
                    border: '1px solid rgba(5, 150, 105, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                    e.currentTarget.style.borderColor = 'rgba(5, 150, 105, 0.3)';
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          padding: '0.5rem',
                          borderRadius: '0.75rem'
                        }}>
                          <ShoppingCart className="w-6 h-6 text-green-400" />
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#f9fafb' }}>
                          {sale.quantity} frascos
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p style={{ color: '#d1d5db' }}>
                          <span style={{ fontWeight: '600' }}>Precio unitario:</span> Bs. {parseFloat(sale.unit_price).toFixed(2)}
                        </p>
                        <p style={{ color: '#34d399', fontWeight: 'bold', fontSize: '1.125rem' }}>
                          Total: Bs. {parseFloat(sale.total_amount).toFixed(2)}
                        </p>
                        <p style={{ color: '#9ca3af' }} className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(sale.created_at)}
                        </p>
                        {sale.notes && (
                          <p style={{
                            color: '#d1d5db',
                            fontStyle: 'italic',
                            background: 'rgba(55, 65, 81, 0.3)',
                            padding: '0.5rem',
                            borderRadius: '0.5rem'
                          }}>
                            "{sale.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(sale)}
                        style={{
                          color: '#60a5fa',
                          background: 'transparent',
                          border: 'none',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.color = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#60a5fa';
                        }}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => openDeleteModal(sale.id)}
                        style={{
                          color: '#f87171',
                          background: 'transparent',
                          border: 'none',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#f87171';
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="¿Eliminar venta?"
        message="Esta venta será eliminada permanentemente y los frascos volverán al stock. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Edit Sale Modal */}
      <EditSaleModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        onSave={handleEdit}
        sale={editModal.sale}
      />
    </div>
  );
}