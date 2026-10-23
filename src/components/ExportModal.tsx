import React from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  AlertTriangle, 
  CalendarClock, 
  RotateCcw, 
  X,
  FileText
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { getProductTotalStock, getProductStockStatus, formatDate, formatCurrency } from '../utils/inventoryHelpers';

interface ExportModalProps {
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const { products, stockAlerts, expiryAlerts, resetToDemoData } = useInventory();

  const downloadFile = (filename: string, content: string) => {
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + content;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const exportFullInventory = () => {
    const headers = ['SKU', 'Código de Barras', 'Producto', 'Categoría', 'Ubicación', 'Stock Físico', 'Unidad', 'Stock Mínimo', 'Estado', 'Costo Unit.', 'Precio Venta', 'Valuación Total'];
    const rows = products.map(p => {
      const stock = getProductTotalStock(p);
      const status = getProductStockStatus(p);
      const val = stock * p.costPrice;
      return [
        `"${p.sku}"`,
        `"${p.barcode}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        `"${p.location}"`,
        stock,
        `"${p.unit}"`,
        p.minStock,
        `"${status}"`,
        p.costPrice.toFixed(2),
        p.salePrice.toFixed(2),
        val.toFixed(2)
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(`inventario_general_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const exportExpiryReport = () => {
    const headers = ['SKU', 'Producto', 'Categoría', 'Lote', 'Cantidad Lote', 'Fecha Caducidad', 'Días Restantes', 'Estado Vencimiento', 'Costo Unit.', 'Valor en Riesgo'];
    const rows = expiryAlerts.map(a => {
      const prod = products.find(p => p.id === a.productId);
      const cost = prod ? prod.costPrice : 0;
      const riskVal = a.quantity * cost;
      return [
        `"${a.sku}"`,
        `"${a.productName.replace(/"/g, '""')}"`,
        `"${a.category}"`,
        `"${a.lotNumber}"`,
        a.quantity,
        `"${a.expiryDate}"`,
        a.daysRemaining,
        `"${a.status}"`,
        cost.toFixed(2),
        riskVal.toFixed(2)
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(`reporte_vencimientos_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const exportLowStockReport = () => {
    const headers = ['SKU', 'Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Punto de Reorden', 'Déficit / Cantidad Sugerida a Comprar', 'Estado'];
    const rows = stockAlerts.map(a => {
      return [
        `"${a.sku}"`,
        `"${a.productName.replace(/"/g, '""')}"`,
        `"${a.category}"`,
        a.currentStock,
        a.minStock,
        a.reorderPoint,
        a.suggestedReorderQty,
        `"${a.status}"`
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(`reporte_stock_critico_compras_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 max-w-md w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Centro de Reportes y Exportación
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3 text-xs">
          {/* Report 1 */}
          <button
            onClick={exportFullInventory}
            className="w-full p-3 border border-slate-200 hover:border-indigo-400 rounded-lg text-left flex items-start gap-3 hover:bg-indigo-50/20 transition-all group"
          >
            <FileSpreadsheet className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900 group-hover:text-indigo-600">
                Inventario General Consolidado (CSV)
              </div>
              <p className="text-slate-500 mt-0.5 text-[11px]">
                Incluye todos los {products.length} productos, códigos de barras, existencias, precios y valuaciones al costo.
              </p>
            </div>
          </button>

          {/* Report 2 */}
          <button
            onClick={exportExpiryReport}
            className="w-full p-3 border border-slate-200 hover:border-rose-400 rounded-lg text-left flex items-start gap-3 hover:bg-rose-50/20 transition-all group"
          >
            <CalendarClock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900 group-hover:text-rose-600">
                Auditoría de Lotes y Vencimientos (CSV)
              </div>
              <p className="text-slate-500 mt-0.5 text-[11px]">
                Detalla los {expiryAlerts.length} lotes con caducidad inminente o vencida con cálculo de valor en riesgo.
              </p>
            </div>
          </button>

          {/* Report 3 */}
          <button
            onClick={exportLowStockReport}
            className="w-full p-3 border border-slate-200 hover:border-amber-400 rounded-lg text-left flex items-start gap-3 hover:bg-amber-50/20 transition-all group"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900 group-hover:text-amber-600">
                Orden de Reposición y Stock Crítico (CSV)
              </div>
              <p className="text-slate-500 mt-0.5 text-[11px]">
                Lista de compras con cálculo automático de unidades necesarias para alcanzar el punto de reorden.
              </p>
            </div>
          </button>

          {/* Demo Data Reset */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px]">¿Desea restaurar el catálogo de prueba?</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('¿Reiniciar inventario a los datos de ejemplo iniciales?')) {
                  resetToDemoData();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 border border-slate-300 hover:bg-slate-100 rounded-md text-slate-700 flex items-center justify-center gap-2 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restablecer Datos Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
