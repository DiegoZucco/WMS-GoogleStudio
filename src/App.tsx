import React, { useState } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import { Header, ActiveTab } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { ProductList } from './components/ProductList';
import { AlertsPanel } from './components/AlertsPanel';
import { MovementHistory } from './components/MovementHistory';
import { BatchLotManager } from './components/BatchLotManager';
import { StockMovementModal } from './components/StockMovementModal';
import { ProductFormModal } from './components/ProductFormModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ExportModal } from './components/ExportModal';
import { NotificationToasts } from './components/NotificationToasts';
import { Product, MovementType } from './types/inventory';

function InventoryApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('inventory');

  // Modal states
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movementModalData, setMovementModalData] = useState<{
    product: Product;
    type: MovementType;
  } | null>(null);
  const [focusedLotProduct, setFocusedLotProduct] = useState<Product | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleOpenMovement = (product: Product, type: MovementType = 'ENTRADA') => {
    setMovementModalData({ product, type });
  };

  const handleOpenLotManager = (product: Product) => {
    setFocusedLotProduct(product);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900">
      {/* 1. Header (Adhering to Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewProduct={() => setIsNewProductOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* 2. Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Metrics Strip */}
        <MetricsOverview onSelectTab={setActiveTab} />

        {/* Tab Views */}
        {activeTab === 'inventory' && (
          <ProductList
            onOpenMovement={handleOpenMovement}
            onOpenLotManager={handleOpenLotManager}
            onEditProduct={handleEditProduct}
            onNewProduct={() => setIsNewProductOpen(true)}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsPanel
            onOpenMovement={handleOpenMovement}
            onOpenLotManager={handleOpenLotManager}
          />
        )}

        {activeTab === 'movements' && (
          <MovementHistory />
        )}

        {activeTab === 'lots' && (
          <BatchLotManager />
        )}
      </main>

      {/* 3. Quiet Corporate Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 font-mono">DGZ-wms</span>
            <span aria-hidden="true">·</span>
            <span>Sistema Integral de Gestión de Inventario, Lotes y Trazabilidad</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Control FEFO Activo</span>
            <span aria-hidden="true">·</span>
            <span>Alertas de Stock y Vencimiento</span>
          </div>
        </div>
      </footer>

      {/* 4. Interactive Modals */}
      {isNewProductOpen && (
        <ProductFormModal onClose={() => setIsNewProductOpen(false)} />
      )}

      {editingProduct && (
        <ProductFormModal
          productToEdit={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {movementModalData && (
        <StockMovementModal
          product={movementModalData.product}
          initialType={movementModalData.type}
          onClose={() => setMovementModalData(null)}
        />
      )}

      {focusedLotProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <BatchLotManager
              initialSelectedProduct={focusedLotProduct}
              isModal={true}
              onClose={() => setFocusedLotProduct(null)}
            />
          </div>
        </div>
      )}

      {isScannerOpen && (
        <BarcodeScannerModal
          onClose={() => setIsScannerOpen(false)}
          onOpenMovement={handleOpenMovement}
        />
      )}

      {isExportOpen && (
        <ExportModal onClose={() => setIsExportOpen(false)} />
      )}

      {/* 5. Live Notification Toasts */}
      <NotificationToasts />
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <InventoryApp />
    </InventoryProvider>
  );
}
