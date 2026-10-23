import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CalendarClock, 
  ShieldAlert, 
  RotateCcw, 
  Trash2, 
  ShoppingCart, 
  Layers, 
  CheckCircle2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatDate, formatCurrency } from '../utils/inventoryHelpers';
import { Product } from '../types/inventory';

interface AlertsPanelProps {
  onOpenMovement: (product: Product, type: 'ENTRADA' | 'SALIDA' | 'AJUSTE') => void;
  onOpenLotManager: (product: Product) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ onOpenMovement, onOpenLotManager }) => {
  const { 
    products, 
    stockAlerts, 
    expiryAlerts, 
    quickReorder, 
    decommissionExpiredLot 
  } = useInventory();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'stock' | 'expiry'>('all');
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const expiredCount = expiryAlerts.filter(a => a.status === 'VENCIDO').length;
  const criticalStockCount = stockAlerts.filter(a => a.status === 'CRITICO').length;

  const handleQuickReorder = (productId: string, qty: number) => {
    quickReorder(productId, qty);
    setReorderingId(null);
  };

  const handleDecommission = (productId: string, lotId: string, lotNumber: string, qty: number) => {
    if (window.confirm(`¿Confirmar baja y decomiso sanitario de ${qty} unidades vencidas del lote ${lotNumber}?`)) {
      decommissionExpiredLot(productId, lotId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Centro de Control de Alertas y Vencimientos</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Monitoreo continuo de umbrales de stock mínimo y caducidad de lotes para prevenir desabastecimiento y mermas.
            </p>
          </div>

          {/* Sub-tab filter buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({stockAlerts.length + expiryAlerts.length})
            </button>
            <button
              onClick={() => setActiveSubTab('stock')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'stock'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Bajo ({stockAlerts.length})
            </button>
            <button
              onClick={() => setActiveSubTab('expiry')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'expiry'
                  ? 'bg-white text-rose-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vencimientos ({expiryAlerts.length})
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: EXPIRY ALERTS */}
      {(activeSubTab === 'all' || activeSubTab === 'expiry') && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 bg-rose-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Alertas de Vencimiento de Lotes
              </h3>
              <span className="text-xs text-slate-500">
                · {expiryAlerts.length} lote(s) requieren atención
              </span>
            </div>
            {expiredCount > 0 && (
              <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                {expiredCount} lote(s) ya vencidos
              </span>
            )}
          </div>

          {expiryAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Todos los lotes están vigentes</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No hay productos vencidos ni con caducidad próxima en los siguientes 45 días.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {expiryAlerts.map(alert => {
                const prod = products.find(p => p.id === alert.productId);
                const estimatedLoss = prod ? alert.quantity * prod.costPrice : 0;
                const isExpired = alert.status === 'VENCIDO';
                const isImminent = alert.status === 'CRITICO_15D';

                return (
                  <div 
                    key={`${alert.productId}-${alert.lotId}`}
                    className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                      isExpired ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isExpired 
                            ? 'bg-rose-100 text-rose-800' 
                            : isImminent 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {isExpired ? 'LOTE VENCIDO' : isImminent ? 'VENCE EN MENOS DE 15 DÍAS' : 'PRÓXIMO A VENCER'}
                        </span>
                        <span className="font-semibold text-slate-900 text-sm">{alert.productName}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                        <span>SKU: <strong className="font-mono text-slate-700">{alert.sku}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Lote: <strong className="font-mono text-slate-800">{alert.lotNumber}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Cantidad en Lote: <strong className="font-mono text-slate-800 tabular-nums">{alert.quantity}</strong> uds</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Fecha de caducidad: <strong className="font-mono text-slate-800">{formatDate(alert.expiryDate)}</strong></span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Valor en riesgo: <strong className="font-mono text-slate-800">{formatCurrency(estimatedLoss)}</strong>
                        </span>
                      </div>

                      {/* Expiry status explanation */}
                      <p className="text-[11px] text-slate-600 mt-1">
                        {isExpired ? (
                          <span className="text-rose-700 font-medium">
                            Caducó hace {Math.abs(alert.daysRemaining)} días. Debe retirarse inmediatamente de circulación para cumplir normativas sanitarias.
                          </span>
                        ) : (
                          <span className="text-amber-800">
                            Quedan <strong className="font-mono font-bold">{alert.daysRemaining} días</strong> para su caducidad. Se recomienda priorizar su rotación mediante criterio FEFO.
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isExpired ? (
                        <button
                          onClick={() => handleDecommission(alert.productId, alert.lotId, alert.lotNumber, alert.quantity)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs transition-colors whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Dar de Baja (Decomisar)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => prod && onOpenMovement(prod, 'SALIDA')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors whitespace-nowrap"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Priorizar Salida (FEFO)</span>
                        </button>
                      )}

                      <button
                        onClick={() => prod && onOpenLotManager(prod)}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-md transition-colors"
                      >
                        Ver Lotes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: LOW STOCK ALERTS */}
      {(activeSubTab === 'all' || activeSubTab === 'stock') && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 bg-amber-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Alertas de Stock Bajo y Punto de Reorden
              </h3>
              <span className="text-xs text-slate-500">
                · {stockAlerts.length} artículo(s) por debajo del stock de seguridad
              </span>
            </div>
            {criticalStockCount > 0 && (
              <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                {criticalStockCount} en nivel crítico
              </span>
            )}
          </div>

          {stockAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Niveles de stock óptimos</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Todos los productos cuentan con existencias superiores a sus puntos de reorden.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stockAlerts.map(alert => {
                const prod = products.find(p => p.id === alert.productId);
                const isCritical = alert.status === 'CRITICO';
                const deficit = Math.max(1, alert.reorderPoint - alert.currentStock);

                return (
                  <div 
                    key={alert.productId}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isCritical ? 'STOCK CRÍTICO' : 'STOCK BAJO'}
                        </span>
                        <span className="font-semibold text-slate-900 text-sm">{alert.productName}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                        <span>SKU: <strong className="font-mono text-slate-700">{alert.sku}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Categoría: <strong className="text-slate-700">{alert.category}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Stock Actual: <strong className="font-mono text-rose-600 font-bold tabular-nums">{alert.currentStock}</strong> uds
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Stock Mínimo: <strong className="font-mono text-slate-700">{alert.minStock}</strong>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Punto de Reorden: <strong className="font-mono text-slate-700">{alert.reorderPoint}</strong>
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 mt-1">
                        Sugerencia de reabastecimiento: <strong className="font-mono text-indigo-700 font-semibold">{alert.suggestedReorderQty} unidades</strong> para alcanzar nivel de reserva operativo.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleQuickReorder(alert.productId, alert.suggestedReorderQty)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors whitespace-nowrap"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Reabastecer ({alert.suggestedReorderQty} uds)</span>
                      </button>

                      {prod && (
                        <button
                          onClick={() => onOpenMovement(prod, 'ENTRADA')}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
                        >
                          Recepción Manual
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
