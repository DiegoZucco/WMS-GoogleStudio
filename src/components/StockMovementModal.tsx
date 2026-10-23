import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  SlidersHorizontal, 
  X, 
  AlertCircle, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Product, MovementType } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';
import { getProductTotalStock, formatDate } from '../utils/inventoryHelpers';

interface StockMovementModalProps {
  product: Product;
  initialType?: MovementType;
  onClose: () => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  product,
  initialType = 'ENTRADA',
  onClose
}) => {
  const { registerMovement } = useInventory();

  const [type, setType] = useState<MovementType>(initialType);
  const [quantity, setQuantity] = useState<number>(10);
  const [lotSelectionMode, setLotSelectionMode] = useState<'FEFO_AUTO' | 'EXISTING_LOT' | 'NEW_LOT'>('FEFO_AUTO');
  const [selectedLotId, setSelectedLotId] = useState<string>(product.lots?.[0]?.id || '');
  const [newLotNumber, setNewLotNumber] = useState(`LT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [newLotExpiry, setNewLotExpiry] = useState('');
  const [referenceDoc, setReferenceDoc] = useState('');
  const [reason, setReason] = useState('');
  const [responsibleUser, setResponsibleUser] = useState('D. Zuccolilli');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentStock = getProductTotalStock(product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (quantity <= 0) {
      setErrorMsg('La cantidad debe ser mayor a 0');
      return;
    }

    if (type === 'SALIDA' && quantity > currentStock) {
      setErrorMsg(`No hay suficiente stock disponible. Stock actual: ${currentStock} ${product.unit}`);
      return;
    }

    if (type === 'ENTRADA' && lotSelectionMode === 'NEW_LOT') {
      if (!newLotNumber || !newLotExpiry) {
        setErrorMsg('Por favor ingrese el número de lote y la fecha de vencimiento.');
        return;
      }
    }

    const success = registerMovement({
      productId: product.id,
      type,
      quantity: Number(quantity),
      lotId: lotSelectionMode === 'EXISTING_LOT' ? selectedLotId : undefined,
      newLotNumber: lotSelectionMode === 'NEW_LOT' ? newLotNumber : undefined,
      newLotExpiry: lotSelectionMode === 'NEW_LOT' ? newLotExpiry : undefined,
      referenceDoc: referenceDoc.trim() || undefined,
      reason: reason.trim() || (type === 'ENTRADA' ? 'Ingreso de mercadería' : type === 'SALIDA' ? 'Despacho regular' : 'Ajuste de inventario'),
      user: responsibleUser.trim() || 'Operador de Inventario'
    });

    if (success) {
      onClose();
    } else {
      setErrorMsg('No se pudo procesar la transacción. Verifique las existencias por lote.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Registrar Movimiento de Stock
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {product.name} · <span className="font-mono">{product.sku}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Stock Banner */}
          <div className="p-3 bg-slate-100 rounded-md flex items-center justify-between">
            <span className="text-slate-600 font-medium">Stock Físico Actual:</span>
            <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
              {currentStock} <span className="text-xs font-normal text-slate-500">{product.unit}</span>
            </span>
          </div>

          {/* Movement Type Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('ENTRADA')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md font-semibold border transition-all ${
                  type === 'ENTRADA'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Entrada</span>
              </button>

              <button
                type="button"
                onClick={() => setType('SALIDA')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md font-semibold border transition-all ${
                  type === 'SALIDA'
                    ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Salida</span>
              </button>

              <button
                type="button"
                onClick={() => setType('AJUSTE')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md font-semibold border transition-all ${
                  type === 'AJUSTE'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Ajuste</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Cantidad a {type === 'ENTRADA' ? 'ingresar' : type === 'SALIDA' ? 'despachar' : 'ajustar'} ({product.unit})
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-md p-2 text-sm font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Lot Assignment / FEFO Logic */}
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
            <label className="block text-slate-700 font-semibold mb-2">
              Asignación de Lote y Vencimiento
            </label>

            {type === 'SALIDA' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="fefo"
                    name="lotSelect"
                    checked={lotSelectionMode === 'FEFO_AUTO'}
                    onChange={() => setLotSelectionMode('FEFO_AUTO')}
                  />
                  <label htmlFor="fefo" className="text-slate-800 font-medium cursor-pointer flex items-center gap-1.5">
                    <span>Automático FEFO (Recomendado)</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-1.5 rounded">Prioriza caducidad</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 pl-5">
                  El sistema deducirá automáticamente del lote más próximo a caducar para prevenir pérdidas.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="radio"
                    id="manualLot"
                    name="lotSelect"
                    checked={lotSelectionMode === 'EXISTING_LOT'}
                    onChange={() => setLotSelectionMode('EXISTING_LOT')}
                  />
                  <label htmlFor="manualLot" className="text-slate-800 font-medium cursor-pointer">
                    Seleccionar lote específico manualmente
                  </label>
                </div>

                {lotSelectionMode === 'EXISTING_LOT' && (
                  <div className="pl-5 pt-1">
                    <select
                      value={selectedLotId}
                      onChange={(e) => setSelectedLotId(e.target.value)}
                      className="w-full border border-slate-300 rounded-md p-1.5 text-xs bg-white"
                    >
                      {product.lots.filter(l => l.quantity > 0).map(l => (
                        <option key={l.id} value={l.id}>
                          Lote {l.lotNumber} ({l.quantity} disp.) - Vence {formatDate(l.expiryDate)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : type === 'ENTRADA' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLotSelectionMode('NEW_LOT')}
                    className={`px-2.5 py-1 text-xs rounded border ${
                      lotSelectionMode === 'NEW_LOT' ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold' : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    + Crear Nuevo Lote
                  </button>
                  <button
                    type="button"
                    onClick={() => setLotSelectionMode('EXISTING_LOT')}
                    className={`px-2.5 py-1 text-xs rounded border ${
                      lotSelectionMode === 'EXISTING_LOT' ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold' : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    Sumar a Lote Existente
                  </button>
                </div>

                {lotSelectionMode === 'NEW_LOT' ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">N° Lote Proveedor</label>
                      <input
                        type="text"
                        value={newLotNumber}
                        onChange={(e) => setNewLotNumber(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1.5 font-mono uppercase text-xs"
                        placeholder="LT-XXXX"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Fecha Caducidad</label>
                      <input
                        type="date"
                        value={newLotExpiry}
                        onChange={(e) => setNewLotExpiry(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedLotId}
                    onChange={(e) => setSelectedLotId(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-1.5 text-xs bg-white"
                  >
                    {product.lots.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.lotNumber} ({l.quantity} en stock) · Vence {formatDate(l.expiryDate)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                Se ajustará el balance contable del lote seleccionado o del lote general por inventario físico.
              </p>
            )}
          </div>

          {/* Reference Document & Reason */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Documento de Referencia
              </label>
              <input
                type="text"
                placeholder="ej: FAC-00912, REM-4821"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Responsable
              </label>
              <input
                type="text"
                value={responsibleUser}
                onChange={(e) => setResponsibleUser(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Motivo o Destino del Movimiento
            </label>
            <input
              type="text"
              placeholder="ej: Entrega a farmacia, reposición semanal de insumos..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-2"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white font-semibold rounded-md shadow-xs transition-colors ${
                type === 'ENTRADA' ? 'bg-emerald-600 hover:bg-emerald-700' :
                type === 'SALIDA' ? 'bg-rose-600 hover:bg-rose-700' :
                'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Registrar {type}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
