import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  History, 
  Boxes, 
  Volume2, 
  VolumeX, 
  Radio, 
  Barcode, 
  Plus, 
  Download,
  RotateCcw
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export type ActiveTab = 'inventory' | 'alerts' | 'movements' | 'lots';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewProduct: () => void;
  onOpenScanner: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewProduct,
  onOpenScanner,
  onOpenExport
}) => {
  const { 
    stockAlerts, 
    expiryAlerts, 
    soundEnabled, 
    toggleSound, 
    liveSimulationActive, 
    toggleLiveSimulation,
    resetToDemoData 
  } = useInventory();

  const totalAlertsCount = stockAlerts.length + expiryAlerts.length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Top Bar Contract: 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold shadow-xs">
              <Boxes className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap font-mono">
                DGZ-wms
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-medium">
                · Control en Tiempo Real
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation tabs with single-line whitespace-nowrap */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4 text-slate-500" />
              <span>Inventario General</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'alerts'
                  ? 'bg-rose-50 text-rose-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${totalAlertsCount > 0 ? 'text-rose-600' : 'text-slate-500'}`} />
              <span>Centro de Alertas</span>
              {totalAlertsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-mono font-semibold rounded bg-rose-600 text-white tabular-nums">
                  {totalAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('movements')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'movements'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Kardex / Movimientos</span>
            </button>

            <button
              onClick={() => setActiveTab('lots')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'lots'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Boxes className="w-4 h-4 text-slate-500" />
              <span>Vencimientos y Lotes</span>
            </button>
          </nav>

          {/* Zone 3: Primary action & quick tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live simulation toggle */}
            <button
              onClick={toggleLiveSimulation}
              title={liveSimulationActive ? "Pausar simulación en vivo" : "Activar flujo en vivo de ventas/recepción"}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                liveSimulationActive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${liveSimulationActive ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span>{liveSimulationActive ? 'Tiempo Real: Activo' : 'Simular Flujo'}</span>
            </button>

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? "Silenciar alertas y beeps" : "Activar sonido"}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Barcode scanner */}
            <button
              onClick={onOpenScanner}
              title="Escáner de código de barras / SKU"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              <Barcode className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Escanear</span>
            </button>

            {/* Export */}
            <button
              onClick={onOpenExport}
              title="Exportar reportes de inventario"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenNewProduct}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="flex md:hidden items-center justify-between border-t border-slate-100 py-2 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'inventory' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Inventario
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'alerts' ? 'bg-rose-600 text-white' : 'text-slate-600'
            }`}
          >
            Alertas ({totalAlertsCount})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'movements' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Kardex
          </button>
          <button
            onClick={() => setActiveTab('lots')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'lots' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Lotes & Vencimiento
          </button>
        </div>
      </div>
    </header>
  );
};
