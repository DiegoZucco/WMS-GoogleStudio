import React, { useState } from 'react';
import { X, Sparkles, Barcode } from 'lucide-react';
import { Product, Category, Lot } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';

interface ProductFormModalProps {
  productToEdit?: Product | null;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  productToEdit = null,
  onClose
}) => {
  const { addProduct, updateProduct } = useInventory();

  const isEdit = Boolean(productToEdit);

  const [sku, setSku] = useState(productToEdit?.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [barcode, setBarcode] = useState(productToEdit?.barcode || `779${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  const [name, setName] = useState(productToEdit?.name || '');
  const [category, setCategory] = useState<Category>(productToEdit?.category || 'Farmacia y Salud');
  const [unit, setUnit] = useState(productToEdit?.unit || 'Unidades');
  const [minStock, setMinStock] = useState<number>(productToEdit?.minStock ?? 30);
  const [reorderPoint, setReorderPoint] = useState<number>(productToEdit?.reorderPoint ?? 50);
  const [maxStock, setMaxStock] = useState<number>(productToEdit?.maxStock ?? 200);
  const [costPrice, setCostPrice] = useState<number>(productToEdit?.costPrice ?? 5.00);
  const [salePrice, setSalePrice] = useState<number>(productToEdit?.salePrice ?? 9.50);
  const [location, setLocation] = useState(productToEdit?.location || 'Almacén Central / Estante A-01');

  // If creating new: optional initial lot
  const [hasInitialLot, setHasInitialLot] = useState<boolean>(!isEdit);
  const [initialLotNumber, setInitialLotNumber] = useState(`LT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [initialExpiryDate, setInitialExpiryDate] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().split('T')[0]
  );
  const [initialQuantity, setInitialQuantity] = useState<number>(50);

  const handleGenerateBarcode = () => {
    setBarcode(`779${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    if (isEdit && productToEdit) {
      updateProduct(productToEdit.id, {
        sku: sku.trim().toUpperCase(),
        barcode: barcode.trim(),
        name: name.trim(),
        category,
        unit,
        minStock: Number(minStock),
        reorderPoint: Number(reorderPoint),
        maxStock: Number(maxStock),
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        location: location.trim()
      });
    } else {
      const lots: Lot[] = [];
      if (hasInitialLot && initialQuantity > 0 && initialLotNumber) {
        lots.push({
          id: `lot-${Date.now()}`,
          lotNumber: initialLotNumber.trim().toUpperCase(),
          expiryDate: initialExpiryDate,
          quantity: Number(initialQuantity),
          initialQuantity: Number(initialQuantity),
          receivedDate: new Date().toISOString().split('T')[0],
          location: location.trim()
        });
      }

      addProduct({
        sku: sku.trim().toUpperCase(),
        barcode: barcode.trim(),
        name: name.trim(),
        category,
        unit,
        minStock: Number(minStock),
        reorderPoint: Number(reorderPoint),
        maxStock: Number(maxStock),
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        location: location.trim(),
        lots
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 max-w-xl w-full shadow-xl max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEdit ? 'Editar Producto del Catálogo' : 'Nuevo Producto en Inventario'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configuración de umbrales de stock mínimo, trazabilidad y control de costos.
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
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Row 1: Name and Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Nombre del Producto / Artículo *
              </label>
              <input
                type="text"
                placeholder="ej: Ibuprofeno 400mg, Válvula de Presión..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full border border-slate-300 rounded-md p-2 bg-white"
              >
                <option value="Farmacia y Salud">Farmacia y Salud</option>
                <option value="Alimentos y Bebidas">Alimentos y Bebidas</option>
                <option value="Insumos Industriales">Insumos Industriales</option>
                <option value="Químicos y Laboratorio">Químicos y Laboratorio</option>
                <option value="Tecnología y Repuestos">Tecnología y Repuestos</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Row 2: SKU & Barcode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Código SKU (Identificador Único) *
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 font-mono uppercase"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold">
                  Código de Barras / EAN-13
                </label>
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Barcode className="w-3 h-3" />
                  <span>Generar</span>
                </button>
              </div>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 font-mono"
              />
            </div>
          </div>

          {/* Row 3: Unit and Physical Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Unidad de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 bg-white"
              >
                <option value="Unidades">Unidades (uds)</option>
                <option value="Cajas">Cajas</option>
                <option value="Litros">Litros (L)</option>
                <option value="Kilogramos">Kilogramos (Kg)</option>
                <option value="Bidones">Bidones</option>
                <option value="Pares">Pares</option>
                <option value="Metros">Metros</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ubicación en Almacén
              </label>
              <input
                type="text"
                placeholder="ej: Depósito Central / Pasillo B / Estante 03"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>
          </div>

          {/* Row 4: Stock Thresholds (Crucial for Low Stock Alerts) */}
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900 mb-2">
              Umbrales para Alertas de Stock Bajo
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Stock Mínimo (Alerta)
                </label>
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-md p-1.5 font-mono bg-white"
                  required
                />
                <span className="text-[10px] text-slate-500">Dispara alerta</span>
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Punto de Reorden
                </label>
                <input
                  type="number"
                  min="0"
                  value={reorderPoint}
                  onChange={(e) => setReorderPoint(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-md p-1.5 font-mono bg-white"
                  required
                />
                <span className="text-[10px] text-slate-500">Nivel de reposición</span>
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Capacidad Máxima
                </label>
                <input
                  type="number"
                  min="0"
                  value={maxStock}
                  onChange={(e) => setMaxStock(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-md p-1.5 font-mono bg-white"
                />
                <span className="text-[10px] text-slate-500">Límite físico</span>
              </div>
            </div>
          </div>

          {/* Row 5: Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Precio de Costo (Unitario)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-md p-2 pl-7 font-mono"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Precio de Venta Sugerido
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-md p-2 pl-7 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 6: Initial Lot (Only for new products) */}
          {!isEdit && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInitialLot}
                    onChange={(e) => setHasInitialLot(e.target.checked)}
                  />
                  <span className="text-xs font-bold text-slate-900">
                    Ingresar lote inicial de recepción y fecha de caducidad
                  </span>
                </label>
              </div>

              {hasInitialLot && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">N° de Lote</label>
                    <input
                      type="text"
                      value={initialLotNumber}
                      onChange={(e) => setInitialLotNumber(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5 font-mono uppercase bg-white"
                      required={hasInitialLot}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Fecha Caducidad</label>
                    <input
                      type="date"
                      value={initialExpiryDate}
                      onChange={(e) => setInitialExpiryDate(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5 font-mono bg-white"
                      required={hasInitialLot}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Cantidad Inicial</label>
                    <input
                      type="number"
                      min="1"
                      value={initialQuantity}
                      onChange={(e) => setInitialQuantity(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5 font-mono bg-white"
                      required={hasInitialLot}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-xs transition-colors"
            >
              {isEdit ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
