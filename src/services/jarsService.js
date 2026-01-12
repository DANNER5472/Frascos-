import { supabase } from './supabase';

// ============================================
// ESTADÍSTICAS GENERALES
// ============================================

export const getBusinessStats = async () => {
  try {
    const { data, error } = await supabase
      .from('business_stats')
      .select('*')
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// COMPRAS DE FRASCOS
// ============================================

export const addPurchase = async (quantity, totalPrice, notes = '') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('purchases')
      .insert([
        {
          quantity,
          total_price: totalPrice,
          notes,
          user_id: user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding purchase:', error);
    return { success: false, error: error.message };
  }
};

export const getPurchases = async (limit = 50) => {
  try {
    // SIN JOIN - directo sin relaciones
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return { success: false, error: error.message };
  }
};

export const deletePurchase = async (id) => {
  try {
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return { success: false, error: error.message };
  }
};

export const updatePurchase = async (id, quantity, totalPrice, notes = '') => {
  try {
    const { error } = await supabase
      .from('purchases')
      .update({
        quantity,
        total_price: totalPrice,
        notes
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating purchase:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// VENTAS DE FRASCOS
// ============================================

export const addSale = async (quantity, unitPrice, notes = '') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('jar_sales')
      .insert([
        {
          quantity,
          unit_price: unitPrice,
          notes,
          user_id: user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding sale:', error);
    return { success: false, error: error.message };
  }
};

export const getSales = async (limit = 50) => {
  try {
    // SIN JOIN - directo sin relaciones
    const { data, error } = await supabase
      .from('jar_sales')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching sales:', error);
    return { success: false, error: error.message };
  }
};

export const deleteSale = async (id) => {
  try {
    const { error } = await supabase
      .from('jar_sales')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting sale:', error);
    return { success: false, error: error.message };
  }
};

export const updateSale = async (id, quantity, unitPrice, notes = '') => {
  try {
    const { error } = await supabase
      .from('jar_sales')
      .update({
        quantity,
        unit_price: unitPrice,
        notes
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating sale:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ============================================
// HISTORIAL COMBINADO
// ============================================

export const getAllTransactions = async () => {
  try {
    console.log('Cargando transacciones...');
    
    // Obtener compras
    const purchasesResult = await getPurchases(100);
    
    const purchases = purchasesResult.success && purchasesResult.data 
      ? purchasesResult.data 
      : [];
    
    const purchasesFormatted = purchases.map(p => ({
      ...p,
      type: 'purchase',
      amount: p.total_price,
      display: `Compra: ${p.quantity} frascos`,
      searchText: `compra ${p.quantity} frascos ${p.notes || ''}`
    }));

    // Obtener ventas
    const salesResult = await getSales(100);
    
    const sales = salesResult.success && salesResult.data 
      ? salesResult.data 
      : [];
    
    const salesFormatted = sales.map(s => ({
      ...s,
      type: 'sale',
      amount: s.total_amount,
      display: `Venta: ${s.quantity} frascos`,
      searchText: `venta ${s.quantity} frascos ${s.notes || ''}`
    }));

    // Obtener gastos
    const expensesResult = await getExpenses(100);
    
    const expenses = expensesResult.success && expensesResult.data 
      ? expensesResult.data 
      : [];
    
    const expensesFormatted = expenses.map(e => ({
      ...e,
      type: 'expense',
      display: e.description,
      searchText: `gasto ${e.description} ${e.notes || ''}`
    }));

    // Combinar y ordenar por fecha
    const all = [
      ...purchasesFormatted,
      ...salesFormatted,
      ...expensesFormatted
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { success: true, data: all };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { success: false, error: error.message, data: [] };
  }
};