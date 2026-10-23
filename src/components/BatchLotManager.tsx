import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Calendar, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertOctagon, 
  ArrowUpDown,
  X
} from 'lucide-react';
import { Product, Lot } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';
import { formatDate, getExpiryStatus, formatCurrency } from '../utils/inventoryHelpers';

interface BatchLotManagerProps {
  initialSelectedProduct?: Product | null;
  onClose?: () => void;
  isModal?: boolean;
}

export const BatchLotManager: React.FC<BatchLotManagerProps> = ({
  initialSelectedProduct = null,
  onClose,
  isModal = false
}) => {
  const { products, addLot, decommissionExpiredLot } = useInventory();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialSelectedProduct?.id || 'ALL'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddLotModal, setShowAddLotModal] = useState<boolean>(false);

  // Form state for adding new lot
  const [newLotProdId, setNewLotProdId] = useState<string>(
    initialSelectedProduct?.id || (products[0]?.id ?? '')
  );
  const [newLotNumber, setNewLotNumber] = useState('');
  const [newLotExpiry, setNewLotExpiry] = useState('');
  const [newLotQuantity, setNewLotQuantity] = useState<number>(50);
  const [newLotLocation, setNewLotLocation] = useState('');

  // Collect flat lots list with product context
  const allLots = useMemo(() => {
    const list: Array<{
      product: Product;
      lot: Lot;
      status: string;
      daysRemaining: number;
    }> = [];

    products.forEach(prod => {
      (prod.lots || []).forEach(lot => {
        const { status, daysRemaining } = getExpiryStatus(lot.expiryDate);
        list.push({
          product: prod,
          lot,
          status,
          daysRemaining
        });
      });
    });

    // Default sort: expired first, then nearest to expiry
    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [products]);

  const filteredLots = useMemo(() => {
    return allLots.filter(item => {
      if (selectedProductId !== 'ALL' && item.product.id !== selectedProductId) {
        return false;
      }

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchProd = item.product.name.toLowerCase().includes(q) || item.product.sku.toLowerCase().includes(q);
        const matchLot = item.lot.lotNumber.toLowerCase().includes(q);
        if (!matchProd && !matchLot) return false;
      }

      if (statusFilter !== 'ALL') {
        if (statusFilter === 'VENCIDO' && item.status !== 'VENCIDO') return false;
        if (statusFilter === 'CRITICO_15D' && item.status !== 'CRITICO_15D') return false;
        if (statusFilter === 'PROXIMO_30D' && item.status !== 'PROXIMO_30D') return false;
        if (statusFilter === 'VIGENTE' && item.status !== 'VIGENTE') return false;
      }

      return true;
    });
  }, [allLots, selectedProductId, searchTerm, statusFilter]);

  const handleCreateLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLotProdId || !newLotNumber || !newLotExpiry || newLotQuantity <= 0) return;

    addLot(newLotProdId, {
      lotNumber: newLotNumber.trim(),
      expiryDate: newLotExpiry,
      quantity: Number(newLotQuantity),
      initialQuantity: Number(newLotQuantity),
      receivedDate: new Date().toISOString().split('T')[0],
      location: newLotLocation.trim() || undefined
    });

    // Reset form
    setNewLotNumber('');
    setNewLotExpiry('');
    setNewLotQuantity(50);
    setNewLotLocation('');
    setShowAddLotModal(false);
  };

  return (
    <div className={`bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs ${isModal ? 'max-h-[90vh] flex flex-col' : ''}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            <span>Gestión y Trazabilidad de Lotes y Vencimientos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rotación inteligente FEFO (First-Expired, First-Out) y monitoreo de caducidad por partida.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddLotModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ingresar Nuevo Lote</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between bg-white">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por lote, producto o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Product selector filter */}
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="text-xs border border-slate-300 rounded-md py-1.5 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Todos los Productos ({products.length})</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>

          {/* Expiry status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md py-1.5 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Estado: Todos</option>
            <option value="VENCIDO">Vencidos</option>
            <option value="CRITICO_15D">Vence &lt; 15 días</option>
            <option value="PROXIMO_30D">Próximo (&lt; 45 días)</option>
            <option value="VIGENTE">Vigente (&gt; 45 días)</option>
          </select>
        </div>
      </div>

      {/* Table of Lots */}
      <div className={`overflow-x-auto ${isModal ? 'flex-1 overflow-y-auto' : ''}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Lote #</th>
              <th className="py-3 px-4">Producto Asociado</th>
              <th className="py-3 px-4">Fecha de Vencimiento</th>
              <th className="py-3 px-4">Días Restantes</th>
              <th className="py-3 px-4 text-right">Existencia Actual</th>
              <th className="py-3 px-4 text-right">Valor Lote</th>
              <th className="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredLots.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  No se encontraron lotes para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredLots.map(({ product, lot, status, daysRemaining }) => {
                const isExpired = status === 'VENCIDO';
                const isCritical = status === 'CRITICO_15D';
                const lotValuation = lot.quantity * product.costPrice;

                return (
                  <tr key={`${product.id}-${lot.id}`} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {lot.lotNumber}
                      </span>
                      {lot.location && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {lot.location}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{product.sku} · {product.category}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(lot.expiryDate)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Recibido: {formatDate(lot.receivedDate)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isExpired ? (
                        <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                          Vencido ({Math.abs(daysRemaining)} días)
                        </span>
                      ) : isCritical ? (
                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                          {daysRemaining} días (Inminente)
                        </span>
                      ) : status === 'PROXIMO_30D' ? (
                        <span className="font-medium text-yellow-800 bg-yellow-50 px-2 py-0.5 rounded text-[11px]">
                          {daysRemaining} días (Próximo)
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">
                          {daysRemaining} días (Vigente)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        {lot.quantity} <span className="text-[11px] font-normal text-slate-500">{product.unit}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Inicial: {lot.initialQuantity}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                      {formatCurrency(lotValuation)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isExpired && lot.quantity > 0 ? (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Decomisar ${lot.quantity} unidades vencidas del lote ${lot.lotNumber}?`)) {
                              decommissionExpiredLot(product.id, lot.id);
                            }
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-rose-700 hover:text-white hover:bg-rose-600 border border-rose-200 rounded transition-colors whitespace-nowrap"
                        >
                          Decomisar
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">Apto circulación</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Lot Modal Popup */}
      {showAddLotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 max-w-md w-full shadow-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Registrar Entrada de Nuevo Lote</h3>
              <button onClick={() => setShowAddLotModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateLot} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Producto</label>
                <select
                  value={newLotProdId}
                  onChange={(e) => setNewLotProdId(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2"
                  required
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Número de Lote / Partida</label>
                <input
                  type="text"
                  placeholder="ej: LT-2026-904B"
                  value={newLotNumber}
                  onChange={(e) => setNewLotNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 font-mono uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={newLotExpiry}
                    onChange={(e) => setNewLotExpiry(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Cantidad Recibida</label>
                  <input
                    type="number"
                    min="1"
                    value={newLotQuantity}
                    onChange={(e) => setNewLotQuantity(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-md p-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Ubicación física (opcional)</label>
                <input
                  type="text"
                  placeholder="ej: Estante B-04 / Cámara Fría"
                  value={newLotLocation}
                  onChange={(e) => setNewLotLocation(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLotModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
                >
                  Guardar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
