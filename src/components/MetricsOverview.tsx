import React from 'react';
import { 
  Boxes, 
  Layers, 
  DollarSign, 
  AlertOctagon, 
  CalendarClock 
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatCurrency } from '../utils/inventoryHelpers';
import { ActiveTab } from './Header';

interface MetricsOverviewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ onSelectTab }) => {
  const { 
    totalSKUs, 
    totalUnits, 
    totalValuation, 
    stockAlerts, 
    expiryAlerts 
  } = useInventory();

  const criticalStockCount = stockAlerts.filter(a => a.status === 'CRITICO').length;
  const expiredLotsCount = expiryAlerts.filter(a => a.status === 'VENCIDO').length;
  const expiringSoonCount = expiryAlerts.filter(a => a.status === 'CRITICO_15D' || a.status === 'PROXIMO_30D').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {/* Metric 1: SKUs */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wide">Catálogo Activo</span>
          <Boxes className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalSKUs}
          </span>
          <span className="text-xs text-slate-500 font-medium">SKUs registrados</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Distribuidos en 6 categorías
        </p>
      </div>

      {/* Metric 2: Total Units */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wide">Stock Total</span>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalUnits.toLocaleString('es-ES')}
          </span>
          <span className="text-xs text-slate-500 font-medium">unidades físicas</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Verificado en tiempo real
        </p>
      </div>

      {/* Metric 3: Total Valuation */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wide">Valuación Al Costo</span>
          <DollarSign className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalValuation)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Cálculo FIFO sobre lotes activos
        </p>
      </div>

      {/* Metric 4: Stock Alerts */}
      <button
        onClick={() => onSelectTab('alerts')}
        className={`p-4 rounded-lg border text-left transition-all ${
          stockAlerts.length > 0 
            ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between text-amber-700 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wide">Stock Bajo / Crítico</span>
          <AlertOctagon className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-900 font-mono tabular-nums">
            {stockAlerts.length}
          </span>
          <span className="text-xs text-amber-800 font-medium">artículos</span>
        </div>
        <p className="mt-1 text-[11px] text-amber-800">
          {criticalStockCount > 0 ? `${criticalStockCount} con nivel crítico` : 'Todos por encima del mínimo'}
        </p>
      </button>

      {/* Metric 5: Expiration Alerts */}
      <button
        onClick={() => onSelectTab('alerts')}
        className={`col-span-2 md:col-span-1 p-4 rounded-lg border text-left transition-all ${
          expiredLotsCount > 0 
            ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between text-rose-700 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wide">Control Vencimientos</span>
          <CalendarClock className="w-4 h-4 text-rose-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-900 font-mono tabular-nums">
            {expiredLotsCount + expiringSoonCount}
          </span>
          <span className="text-xs text-rose-800 font-medium">lotes en riesgo</span>
        </div>
        <p className="mt-1 text-[11px] text-rose-800">
          {expiredLotsCount > 0 ? `${expiredLotsCount} vencidos · ${expiringSoonCount} por vencer` : 'Sin lotes vencidos'}
        </p>
      </button>
    </div>
  );
};
