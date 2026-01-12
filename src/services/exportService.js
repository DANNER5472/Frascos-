import jsPDF from 'jspdf';

// ============================================
// FUNCIONES HELPER
// ============================================

const addHeader = (doc, title, subtitle = '') => {
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte del Negocio', 20, 15);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 20, 25);
  
  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    doc.text(subtitle, 20, 31);
  }
  
  return 40;
};

const addFooter = (doc, pageNum, totalPages) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  doc.setFillColor(30, 41, 59);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const date = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.text(`Generado: ${date}`, 20, pageHeight - 10);
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 50, pageHeight - 10);
};

// ============================================
// EXPORTAR COMPRAS
// ============================================

export const exportPurchasesPDF = (purchases) => {
  const doc = new jsPDF();
  
  const startY = addHeader(
    doc,
    'Reporte de Compras',
    `${purchases.length} transacciones registradas`
  );
  
  let currentY = startY + 5;
  
  // Encabezados de tabla
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Fecha', 20, currentY);
  doc.text('Cantidad', 65, currentY);
  doc.text('Total (Bs.)', 105, currentY);
  doc.text('Costo Unit.', 145, currentY);
  
  currentY += 5;
  
  // Línea separadora
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(20, currentY, 190, currentY);
  currentY += 5;
  
  // Datos
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(8);
  
  purchases.forEach((purchase, index) => {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
      
      // Repetir encabezados
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(9);
      doc.text('Fecha', 20, currentY);
      doc.text('Cantidad', 65, currentY);
      doc.text('Total (Bs.)', 105, currentY);
      doc.text('Costo Unit.', 145, currentY);
      currentY += 5;
      doc.line(20, currentY, 190, currentY);
      currentY += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(8);
    }
    
    const date = new Date(purchase.created_at).toLocaleDateString('es-ES');
    const quantity = purchase.quantity;
    const total = parseFloat(purchase.total_price).toFixed(2);
    const unitCost = parseFloat(purchase.unit_cost || (purchase.total_price / purchase.quantity)).toFixed(2);
    
    doc.text(date, 20, currentY);
    doc.text(quantity.toString(), 65, currentY);
    doc.text(`Bs. ${total}`, 105, currentY);
    doc.text(`Bs. ${unitCost}`, 145, currentY);
    
    currentY += 5;
  });
  
  // Total
  currentY += 5;
  doc.setDrawColor(59, 130, 246);
  doc.line(20, currentY, 190, currentY);
  currentY += 5;
  
  const totalQuantity = purchases.reduce((sum, p) => sum + parseInt(p.quantity), 0);
  const totalAmount = purchases.reduce((sum, p) => sum + parseFloat(p.total_price), 0);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL:', 20, currentY);
  doc.text(totalQuantity.toString() + ' frascos', 65, currentY);
  doc.text(`Bs. ${totalAmount.toFixed(2)}`, 105, currentY);
  
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  doc.save(`compras_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================
// EXPORTAR VENTAS
// ============================================

export const exportSalesPDF = (sales) => {
  const doc = new jsPDF();
  
  const startY = addHeader(
    doc,
    'Reporte de Ventas',
    `${sales.length} transacciones registradas`
  );
  
  let currentY = startY + 5;
  
  // Encabezados de tabla
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('Fecha', 20, currentY);
  doc.text('Cantidad', 65, currentY);
  doc.text('Precio Unit.', 105, currentY);
  doc.text('Total (Bs.)', 145, currentY);
  
  currentY += 5;
  
  // Línea separadora
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(20, currentY, 190, currentY);
  currentY += 5;
  
  // Datos
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(8);
  
  sales.forEach((sale, index) => {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
      
      // Repetir encabezados
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(9);
      doc.text('Fecha', 20, currentY);
      doc.text('Cantidad', 65, currentY);
      doc.text('Precio Unit.', 105, currentY);
      doc.text('Total (Bs.)', 145, currentY);
      currentY += 5;
      doc.line(20, currentY, 190, currentY);
      currentY += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(8);
    }
    
    const date = new Date(sale.created_at).toLocaleDateString('es-ES');
    const quantity = sale.quantity;
    const unitPrice = parseFloat(sale.unit_price).toFixed(2);
    const total = parseFloat(sale.total_amount).toFixed(2);
    
    doc.text(date, 20, currentY);
    doc.text(quantity.toString(), 65, currentY);
    doc.text(`Bs. ${unitPrice}`, 105, currentY);
    doc.text(`Bs. ${total}`, 145, currentY);
    
    currentY += 5;
  });
  
  // Total
  currentY += 5;
  doc.setDrawColor(16, 185, 129);
  doc.line(20, currentY, 190, currentY);
  currentY += 5;
  
  const totalQuantity = sales.reduce((sum, s) => sum + parseInt(s.quantity), 0);
  const totalAmount = sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL:', 20, currentY);
  doc.text(totalQuantity.toString() + ' frascos', 65, currentY);
  doc.text(`Bs. ${totalAmount.toFixed(2)}`, 145, currentY);
  
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  doc.save(`ventas_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================
// EXPORTAR ESTADÍSTICAS (DASHBOARD)
// ============================================

export const exportStatsPDF = async (stats, purchases = [], sales = []) => {
  const doc = new jsPDF();
  
  const startY = addHeader(
    doc,
    
    `Generado el ${new Date().toLocaleDateString('es-ES')}`
  );
  
  let currentY = startY + 5;
  
  // INVENTARIO
  doc.setFillColor(59, 130, 246);
  doc.rect(20, currentY, doc.internal.pageSize.width - 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INVENTARIO', 25, currentY + 6);
  
  currentY += 13;
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Stock Actual: ${stats.current_stock} frascos`, 25, currentY);
  currentY += 5;
  doc.text(`Total Comprado: ${stats.total_purchased || 0} frascos`, 25, currentY);
  currentY += 5;
  doc.text(`Total Vendido: ${stats.total_jars_sold || 0} frascos`, 25, currentY);
  
  currentY += 10;
  
  // FINANCIERO
  doc.setFillColor(16, 185, 129);
  doc.rect(20, currentY, doc.internal.pageSize.width - 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FINANCIERO', 25, currentY + 6);
  
  currentY += 13;
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Invertido: Bs. ${stats.total_purchases.toFixed(2)}`, 25, currentY);
  currentY += 5;
  doc.text(`Total Ventas: Bs. ${stats.total_sales.toFixed(2)}`, 25, currentY);
  currentY += 5;
  doc.text(`Ganancia Neta: Bs. ${stats.net_profit.toFixed(2)}`, 25, currentY);
  
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  doc.save(`reporte-completo_${new Date().toISOString().split('T')[0]}.pdf`);
};