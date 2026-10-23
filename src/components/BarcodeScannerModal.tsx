import React, { useState, useEffect, useRef } from 'react';
import { 
  Barcode, 
  Search, 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Layers
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product } from '../types/inventory';
import { getProductTotalStock, getProductNearestExpiry, formatDate } from '../utils/inventoryHelpers';
import { sounds } from '../utils/audio';

interface BarcodeScannerModalProps {
  onClose: () => void;
  onOpenMovement: (product: Product, type: 'ENTRADA' | 'SALIDA' | 'AJUSTE') => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  onClose,
  onOpenMovement
}) => {
  const { products, registerMovement } = useInventory();

  const [inputCode, setInputCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on open for immediate keyboard/gun scanning
    inputRef.current?.focus();
  }, []);

  const handleLookup = (code: string) => {
    const clean = code.trim().toLowerCase();
    if (!clean) return;

    const match = products.find(p => 
      p.barcode.toLowerCase() === clean || 
      p.sku.toLowerCase() === clean ||
      p.lots.some(l => l.lotNumber.toLowerCase() === clean)
    );

    if (match) {
      setScannedProduct(match);
      sounds.playScanSuccess();
      setFeedback(`Código verificado: "${match.name}"`);
    } else {
      setScannedProduct(null);
      sounds.playWarningAlert();
      setFeedback(`No se encontró ningún artículo para el código "${code}".`);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(inputCode);
  };

  const handleQuickAction = (type: 'ENTRADA' | 'SALIDA') => {
    if (!scannedProduct) return;

    const success = registerMovement({
      productId: scannedProduct.id,
      type,
      quantity: 1,
      referenceDoc: 'SCANNER-RAPIDO',
      reason: `Operación rápida por lector de código (${type})`,
      user: 'Operador Pistola Láser'
    });

    if (success) {
      sounds.playActionSuccess();
      // re-fetch fresh product
      const updated = products.find(p => p.id === scannedProduct.id);
      if (updated) setScannedProduct(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center">
              <Barcode className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Terminal de Escaneo Láser / SKU
              </h3>
              <p className="text-[11px] text-slate-500">
                Compatible con pistolas lectoras USB/Bluetooth y teclado numérico.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Input */}
        <div className="p-5 space-y-4">
          <form onSubmit={handleFormSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Escanee con pistola o tipee código de barras / SKU..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full pl-4 pr-24 py-2.5 text-xs font-mono border-2 border-slate-300 rounded-md focus:border-indigo-600 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700"
            >
              Consultar
            </button>
          </form>

          {/* Quick presets for fast testing */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Códigos de prueba rápida (Click para simular lectura):
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {products.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setInputCode(p.barcode);
                    handleLookup(p.barcode);
                  }}
                  className="px-2 py-1 text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  {p.sku}
                </button>
              ))}
            </div>
          </div>

          {feedback && (
            <div className={`p-2.5 text-xs rounded-md ${
              scannedProduct ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}>
              {feedback}
            </div>
          )}

          {/* Scanned Product Card */}
          {scannedProduct && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{scannedProduct.name}</h4>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    SKU: {scannedProduct.sku} · Barcode: {scannedProduct.barcode}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Stock Actual</span>
                  <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                    {getProductTotalStock(scannedProduct)} {scannedProduct.unit}
                  </span>
                </div>
              </div>

              {/* Nearest Lot */}
              {(() => {
                const { lot, daysRemaining, status } = getProductNearestExpiry(scannedProduct);
                if (!lot) return null;
                return (
                  <div className="p-2.5 bg-white rounded border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Próximo Vencimiento (FEFO)</span>
                      <span className="font-mono font-semibold text-slate-800">
                        Lote {lot.lotNumber} ({formatDate(lot.expiryDate)})
                      </span>
                    </div>
                    <span className={`text-[11px] font-semibold ${
                      status === 'VENCIDO' ? 'text-rose-600' : status === 'CRITICO_15D' ? 'text-amber-600' : 'text-slate-600'
                    }`}>
                      {status === 'VENCIDO' ? 'VENCIDO' : `${daysRemaining} días restantes`}
                    </span>
                  </div>
                );
              })()}

              {/* Quick Operation Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickAction('SALIDA')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Despacho Rápido (-1)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction('ENTRADA')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Recepción Rápida (+1)</span>
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onOpenMovement(scannedProduct, 'SALIDA');
                    onClose();
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Abrir asistente de movimiento completo con múltiples unidades →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
