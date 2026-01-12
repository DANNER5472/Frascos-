import { useState, useEffect } from 'react';
import { addPurchase, getPurchases, deletePurchase, updatePurchase } from '../services/jarsService';
import { exportPurchasesPDF } from '../services/exportService';
import { supabase } from '../services/supabase';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import EditPurchaseModal from '../components/EditPurchaseModal';
import PurchasesByDay from '../components/PurchasesByDay';
import useToast from '../hooks/useToast';
import ResponsiveFilters from '../components/ResponsiveFilters';
import { Package, Plus, Trash2, Edit, RefreshCw, Calendar, TrendingDown, Filter, Download } from 'lucide-react';

export default function Purchases() {
  const [quantity, setQuantity] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [editModal, setEditModal] = useState({ isOpen: false, purchase: null });
  const [specificDate, setSpecificDate] = useState('');
  const { toast, showSuccess, showError, hideToast } = useToast();

  const unitCost = quantity && totalPrice ? (parseFloat(totalPrice) / parseInt(quantity)).toFixed(2) : '0.00';

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
    loadPurchases();
  }, []);

  useEffect(() => {
    filterPurchasesByDate();
  }, [dateFilter, purchases, specificDate]);

  const loadPurchases = async () => {
    setLoadingList(true);
    const result = await getPurchases();
    if (result.success) {
      setPurchases(result.data);
      // Forzar actualización inmediata del filtro
      applyFilter(result.data, dateFilter);
    }
    setLoadingList(false);
  };

  const applyFilter = (purchasesData, filter) => {
    if (!purchasesData || purchasesData.length === 0) {
      setFilteredPurchases([]);
      return;
    }

    // Si hay fecha específica seleccionada, filtrar por esa fecha
    if (specificDate) {
      const selectedDate = new Date(specificDate + 'T00:00:00');
      const filtered = purchasesData.filter(purchase => {
        const purchaseDate = new Date(purchase.created_at);
        const purchaseDateOnly = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate());
        const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        return purchaseDateOnly.getTime() === selectedDateOnly.getTime();
      });
      setFilteredPurchases(filtered);
      return;
    }

    if (filter === 'all') {
      setFilteredPurchases(purchasesData);
      return;
    }

    const now = new Date();
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const filtered = purchasesData.filter(purchase => {
      const purchaseDate = new Date(purchase.created_at);
      const purchaseDateOnly = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate());
      
      switch(filter) {
        case 'today':
          return purchaseDateOnly.getTime() === nowDateOnly.getTime();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return purchaseDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return purchaseDate >= monthAgo;
        default:
          return true;
      }
    });
    
    setFilteredPurchases(filtered);
  };

  const filterPurchasesByDate = () => {
    applyFilter(purchases, dateFilter);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!quantity || !totalPrice) {
      showError('Completa todos los campos requeridos');
      setLoading(false);
      return;
    }

    if (parseInt(quantity) <= 0 || parseFloat(totalPrice) <= 0) {
      showError('La cantidad y el precio deben ser mayores a 0');
      setLoading(false);
      return;
    }

    const result = await addPurchase(
      parseInt(quantity),
      parseFloat(totalPrice),
      notes
    );

    if (result.success) {
      showSuccess(`Compra registrada: ${quantity} frascos por Bs. ${totalPrice}`);
      setQuantity('');
      setTotalPrice('');
      setNotes('');
      loadPurchases();
    } else {
      showError(result.error || 'Error al registrar la compra');
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    const result = await deletePurchase(id);
    if (result.success) {
      loadPurchases();
      showSuccess('Compra eliminada correctamente');
    } else {
      showError(result.error || 'Error al eliminar la compra');
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

  const openEditModal = (purchase) => {
    setEditModal({ isOpen: true, purchase });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, purchase: null });
  };

  const handleEdit = async (updatedData) => {
    const result = await updatePurchase(
      updatedData.id,
      updatedData.quantity,
      updatedData.total_price,
      updatedData.notes
    );

    if (result.success) {
      loadPurchases();
      showSuccess('Compra actualizada correctamente');
      return true;
    } else {
      showError(result.error || 'Error al actualizar la compra');
      return false;
    }
  };


  const handleExportPDF = () => {
    if (filteredPurchases.length === 0) {
      alert('No hay compras para exportar');
      return;
    }
    exportPurchasesPDF(filteredPurchases);
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
            background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)',
            padding: '1rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
          }}>
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#f9fafb',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              Registrar Compra
            </h2>
            <p style={{ color: '#d1d5db', marginTop: '0.25rem' }}>
              Agrega frascos a tu inventario
            </p>
          </div>
        </div>

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
                    if (value === '' || /^\d+$/.test(value)) {
                      setQuantity(value);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #374151',
                    borderRadius: '1rem',
                    background: '#1f2937',
                    color: '#f3f4f6',
                    fontSize: '1.125rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  placeholder="100"
                  disabled={loading}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#e5e7eb',
                  marginBottom: '0.5rem'
                }}>
                  Precio Total (Bs.) *
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={totalPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setTotalPrice(value);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #374151',
                    borderRadius: '1rem',
                    background: '#1f2937',
                    color: '#f3f4f6',
                    fontSize: '1.125rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  placeholder="500.00"
                  disabled={loading}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>
            </div>

            {/* Cálculo automático */}
            {quantity && totalPrice && (
              <div style={{
                background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '1rem',
                padding: '1.5rem'
              }}>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="w-6 h-6 text-blue-400" />
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#93c5fd'
                  }}>
                    Cálculo Automático
                  </p>
                </div>
                <p style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#60a5fa'
                }}>
                  Bs. {unitCost} por frasco
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
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #374151',
                  borderRadius: '1rem',
                  background: '#1f2937',
                  color: '#f3f4f6',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
                placeholder="Ej: Compra al proveedor Juan"
                rows="3"
                disabled={loading}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#374151'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
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
                  Registrar Compra
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tabla de Compras por Día */}
        <PurchasesByDay purchases={purchases} />

        {/* Historial */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#f9fafb'
            }}>
              Historial de Compras
            </h3>
            
            {/* Filtros */}
            <ResponsiveFilters 
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              specificDate={specificDate}
              setSpecificDate={setSpecificDate}
              onExport={handleExportPDF}
              onClearDate={() => {
                setSpecificDate('');
                applyFilter(purchases, dateFilter);
              }}
              data={filteredPurchases}
            />
          </div>

          {loadingList ? (
            <div className="text-center py-12">
              <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-3" />
              <p style={{ color: '#9ca3af' }}>Cargando compras...</p>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div style={{
              background: 'rgba(31, 41, 55, 0.8)',
              borderRadius: '1.5rem',
              padding: '3rem',
              textAlign: 'center',
              border: '1px solid #374151'
            }}>
              <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                {dateFilter === 'all' ? 'No hay compras registradas' : 'No hay compras en este período'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  style={{
                    background: 'rgba(31, 41, 55, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '1.5rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    padding: '1.5rem',
                    border: '1px solid rgba(55, 65, 81, 0.5)',
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          padding: '0.5rem',
                          borderRadius: '0.75rem'
                        }}>
                          <Package className="w-6 h-6 text-blue-400" />
                        </div>
                        <span style={{
                          fontWeight: 'bold',
                          fontSize: '1.5rem',
                          color: '#f9fafb'
                        }}>
                          {purchase.quantity} frascos
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p style={{ color: '#d1d5db' }}>
                          <span style={{ fontWeight: '600' }}>Total:</span> Bs. {parseFloat(purchase.total_price).toFixed(2)}
                        </p>
                        <p style={{ color: '#d1d5db' }}>
                          <span style={{ fontWeight: '600' }}>Costo unitario:</span> Bs. {parseFloat(purchase.unit_cost).toFixed(2)}
                        </p>
                        <p style={{ color: '#9ca3af' }} className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(purchase.created_at)}
                        </p>
                        {purchase.notes && (
                          <p style={{
                            color: '#d1d5db',
                            fontStyle: 'italic',
                            background: 'rgba(55, 65, 81, 0.3)',
                            padding: '0.5rem',
                            borderRadius: '0.5rem'
                          }}>
                            "{purchase.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(purchase)}
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
                          onClick={() => openDeleteModal(purchase.id)}
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
        title="¿Eliminar compra?"
        message="Esta compra será eliminada permanentemente y afectará el stock actual. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Edit Purchase Modal */}
      <EditPurchaseModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        onSave={handleEdit}
        purchase={editModal.purchase}
      />
    </div>
  );
}