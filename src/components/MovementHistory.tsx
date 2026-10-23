import React, { useState, useMemo } from 'react';
import { 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  SlidersHorizontal, 
  Search, 
  Download, 
  Filter, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { MovementType } from '../types/inventory';
import { formatDate } from '../utils/inventoryHelpers';

export const MovementHistory: React.FC = () => {
  const { movements, products } = useInventory();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [productFilter, setProductFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovements = useMemo(() => {
    return movements.filter(mov => {
      if (typeFilter !== 'ALL' && mov.type !== typeFilter) {
        return false;
      }

      if (productFilter !== 'ALL' && mov.productId !== productFilter) {
        return false;
      }

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchName = mov.productName.toLowerCase().includes(q);
        const matchSku = mov.productSku.toLowerCase().includes(q);
        const matchDoc = mov.referenceDoc?.toLowerCase().includes(q);
        const matchLot = mov.lotNumber?.toLowerCase().includes(q);
        const matchReason = mov.reason.toLowerCase().includes(q);
        const matchUser = mov.user.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchDoc && !matchLot && !matchReason && !matchUser) {
          return false;
        }
      }

      return true;
    });
  }, [movements, typeFilter, productFilter, searchTerm]);

  const handleExportCSV = () => {
    const headers = ['Fecha', 'Tipo', 'SKU', 'Producto', 'Lote', 'Cantidad', 'Stock Anterior', 'Nuevo Saldo', 'Documento', 'Motivo', 'Operador'];
    const rows = filteredMovements.map(m => [
      `"${new Date(m.timestamp).toLocaleString('es-ES')}"`,
      `"${m.type}"`,
      `"${m.productSku}"`,
      `"${m.productName.replace(/"/g, '""')}"`,
      `"${m.lotNumber || '-'}"`,
      m.type === 'SALIDA' ? -m.quantity : m.quantity,
      m.previousStock,
      m.newStock,
      `"${m.referenceDoc || '-'}"`,
      `"${m.reason.replace(/"/g, '""')}"`,
      `"${m.user}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dgz_wms_kardex_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Kardex y Libro de Movimientos en Tiempo Real</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico inmutable de entradas, salidas, mermas y auditorías de inventario.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Exportar Kardex (CSV)</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between bg-white">
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por documento, producto, lote, motivo u operador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md py-1.5 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Tipo: Todos</option>
            <option value="ENTRADA">Entradas (+)</option>
            <option value="SALIDA">Salidas (-)</option>
            <option value="AJUSTE">Ajustes / Mermas</option>
          </select>

          {/* Product Filter */}
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md py-1.5 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[200px]"
          >
            <option value="ALL">Producto: Todos</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Fecha & Hora</th>
              <th className="py-3 px-4">Operación</th>
              <th className="py-3 px-4">Producto & SKU</th>
              <th className="py-3 px-4">Lote Asociado</th>
              <th className="py-3 px-4 text-right">Variación</th>
              <th className="py-3 px-4 text-right">Saldo en Stock</th>
              <th className="py-3 px-4">Referencia / Motivo</th>
              <th className="py-3 px-4">Operador</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredMovements.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500">
                  No hay movimientos registrados que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filteredMovements.map(mov => {
                const isEntry = mov.type === 'ENTRADA';
                const isExit = mov.type === 'SALIDA';

                return (
                  <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-slate-900 font-medium text-[11px]">
                        {new Date(mov.timestamp).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(mov.timestamp).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Operation Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded ${
                        isEntry ? 'bg-emerald-50 text-emerald-700' :
                        isExit ? 'bg-rose-50 text-rose-700' :
                        'bg-indigo-50 text-indigo-700'
                      }`}>
                        {isEntry ? <ArrowDownLeft className="w-3.5 h-3.5" /> :
                         isExit ? <ArrowUpRight className="w-3.5 h-3.5" /> :
                         <SlidersHorizontal className="w-3.5 h-3.5" />}
                        <span>{mov.type}</span>
                      </span>
                    </td>

                    {/* Product & SKU */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 line-clamp-1">{mov.productName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{mov.productSku}</div>
                    </td>

                    {/* Lot */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {mov.lotNumber || 'General'}
                      </span>
                    </td>

                    {/* Quantity Changed */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className={`font-mono font-bold text-xs tabular-nums ${
                        isEntry ? 'text-emerald-600' : isExit ? 'text-rose-600' : 'text-indigo-600'
                      }`}>
                        {isEntry ? `+${mov.quantity}` : isExit ? `-${mov.quantity}` : `±${mov.quantity}`}
                      </span>
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {mov.newStock}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">
                        (ant: {mov.previousStock})
                      </span>
                    </td>

                    {/* Reference & Reason */}
                    <td className="py-3 px-4">
                      {mov.referenceDoc && (
                        <div className="font-mono text-[11px] text-slate-800 font-medium">
                          {mov.referenceDoc}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {mov.reason}
                      </div>
                    </td>

                    {/* Responsible User */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        <span>{mov.user}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Total de registros en kardex: <strong className="text-slate-800 font-mono">{movements.length}</strong>
        </span>
        <span className="text-[11px] text-slate-400">
          Trazabilidad auditable
        </span>
      </div>
    </div>
  );
};
