import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Layers, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Filter, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Product, Category, StockStatus } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';
import { 
  getProductTotalStock, 
  getProductStockStatus, 
  getProductNearestExpiry, 
  formatCurrency, 
  formatDate 
} from '../utils/inventoryHelpers';

interface ProductListProps {
  onOpenMovement: (product: Product, type: 'ENTRADA' | 'SALIDA' | 'AJUSTE') => void;
  onOpenLotManager: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onNewProduct: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  onOpenMovement,
  onOpenLotManager,
  onEditProduct,
  onNewProduct
}) => {
  const { products, deleteProduct } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<string>('ALL');
  const [expiryFilter, setExpiryFilter] = useState<string>('ALL');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const categories: Category[] = [
    'Farmacia y Salud',
    'Alimentos y Bebidas',
    'Insumos Industriales',
    'Químicos y Laboratorio',
    'Tecnología y Repuestos',
    'General'
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search text
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchSku = p.sku.toLowerCase().includes(query);
        const matchBarcode = p.barcode.toLowerCase().includes(query);
        const matchLoc = p.location.toLowerCase().includes(query);
        if (!matchName && !matchSku && !matchBarcode && !matchLoc) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // Stock status
      const status = getProductStockStatus(p);
      if (stockFilter !== 'ALL') {
        if (stockFilter === 'ALERT' && status !== 'CRITICO' && status !== 'BAJO') return false;
        if (stockFilter === 'CRITICO' && status !== 'CRITICO') return false;
        if (stockFilter === 'BAJO' && status !== 'BAJO') return false;
        if (stockFilter === 'OPTIMO' && status !== 'OPTIMO') return false;
      }

      // Expiry status
      if (expiryFilter !== 'ALL') {
        const { status: expStatus } = getProductNearestExpiry(p);
        if (expiryFilter === 'VENCIDO' && expStatus !== 'VENCIDO') return false;
        if (expiryFilter === 'EXPIRING' && expStatus !== 'CRITICO_15D' && expStatus !== 'PROXIMO_30D') return false;
      }

      return true;
    });
  }, [products, searchTerm, selectedCategory, stockFilter, expiryFilter]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Está seguro de eliminar el producto "${name}" del catálogo de inventario?`)) {
      deleteProduct(id);
    }
    setMenuOpenId(null);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      {/* Search and Filter Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU, código de barras o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-md py-1.5 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Todas las Categorías</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-md py-1.5 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Estado de Stock: Todos</option>
            <option value="ALERT">En Alerta (Crítico o Bajo)</option>
            <option value="CRITICO">Solo Críticos</option>
            <option value="BAJO">Solo Stock Bajo</option>
            <option value="OPTIMO">Stock Óptimo</option>
          </select>

          {/* Expiry Filter */}
          <select
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-md py-1.5 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Vencimientos: Todos</option>
            <option value="VENCIDO">Con Lotes Vencidos</option>
            <option value="EXPIRING">Por Vencer (&lt; 45 días)</option>
          </select>

          {(searchTerm || selectedCategory !== 'ALL' || stockFilter !== 'ALL' || expiryFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setStockFilter('ALL');
                setExpiryFilter('ALL');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Producto & Identificación</th>
              <th className="py-3 px-4">Ubicación</th>
              <th className="py-3 px-4">Nivel de Stock</th>
              <th className="py-3 px-4">Control Vencimiento (FEFO)</th>
              <th className="py-3 px-4 text-right">Valuación</th>
              <th className="py-3 px-4 text-right">Operaciones Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">No se encontraron productos coincidentes</p>
                    <p className="text-xs text-slate-500 mt-1">Pruebe ajustando los filtros de búsqueda o registre un nuevo artículo.</p>
                    <button
                      onClick={onNewProduct}
                      className="mt-4 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700"
                    >
                      + Crear Nuevo Producto
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const totalStock = getProductTotalStock(product);
                const stockStatus = getProductStockStatus(product);
                const { lot: nearestLot, daysRemaining, status: expStatus } = getProductNearestExpiry(product);
                const valuation = totalStock * product.costPrice;

                // Percentage of min stock for visual bar
                const stockRatio = product.minStock > 0 ? (totalStock / product.minStock) * 100 : 100;
                const barColor = 
                  stockStatus === 'CRITICO' ? 'bg-rose-500' :
                  stockStatus === 'BAJO' ? 'bg-amber-500' :
                  stockStatus === 'SOBRESTOCK' ? 'bg-purple-500' : 'bg-emerald-500';

                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Product & SKU */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => onOpenLotManager(product)}>
                          {product.name}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono text-slate-700">{product.sku}</span>
                          <span aria-hidden="true">·</span>
                          <span>{product.category}</span>
                          {product.barcode && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-slate-400">EAN: {product.barcode}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-slate-600">
                      <span className="text-[11px] font-medium">{product.location || 'Sin asignar'}</span>
                    </td>

                    {/* Stock Level */}
                    <td className="py-3 px-4">
                      <div className="w-36">
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="font-mono font-bold text-slate-900 tabular-nums">
                            {totalStock} <span className="text-[11px] font-normal text-slate-500">{product.unit}</span>
                          </span>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                            stockStatus === 'CRITICO' ? 'text-rose-600' :
                            stockStatus === 'BAJO' ? 'text-amber-600' :
                            stockStatus === 'SOBRESTOCK' ? 'text-purple-600' : 'text-emerald-600'
                          }`}>
                            {stockStatus === 'CRITICO' ? 'Crítico' :
                             stockStatus === 'BAJO' ? 'Bajo' :
                             stockStatus === 'SOBRESTOCK' ? 'Exceso' : 'Óptimo'}
                          </span>
                        </div>
                        {/* Level bar */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor} transition-all duration-300`}
                            style={{ width: `${Math.min(100, Math.max(8, stockRatio))}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          Mín: {product.minStock} · P.Reorden: {product.reorderPoint}
                        </div>
                      </div>
                    </td>

                    {/* Expiry / Lot Status */}
                    <td className="py-3 px-4">
                      {nearestLot ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-700 text-[11px] font-medium">
                              {nearestLot.lotNumber}
                            </span>
                            <span className="text-slate-400 text-[10px]">({nearestLot.quantity} uds)</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="font-mono text-[11px] text-slate-600">
                              {formatDate(nearestLot.expiryDate)}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            {expStatus === 'VENCIDO' ? (
                              <span className="text-rose-600 font-semibold text-[11px]">
                                Vencido (hace {Math.abs(daysRemaining)}d)
                              </span>
                            ) : expStatus === 'CRITICO_15D' ? (
                              <span className="text-amber-600 font-semibold text-[11px]">
                                Vence en {daysRemaining}d
                              </span>
                            ) : expStatus === 'PROXIMO_30D' ? (
                              <span className="text-yellow-700 font-medium text-[11px]">
                                Vence en {daysRemaining}d
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">
                                {daysRemaining}d vigentes
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Sin lotes activos</span>
                      )}
                    </td>

                    {/* Valuation */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-medium text-slate-900 tabular-nums">
                        {formatCurrency(valuation)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Costo: {formatCurrency(product.costPrice)}
                      </div>
                    </td>

                    {/* Quick Operations */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenMovement(product, 'ENTRADA')}
                          title="Registrar Entrada / Compra"
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors whitespace-nowrap"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>Entrada</span>
                        </button>

                        <button
                          onClick={() => onOpenMovement(product, 'SALIDA')}
                          title="Registrar Salida / Venta (FIFO/FEFO)"
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Salida</span>
                        </button>

                        <button
                          onClick={() => onOpenLotManager(product)}
                          title="Gestionar Lotes y Vencimientos"
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Layers className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpenId(menuOpenId === product.id ? null : product.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {menuOpenId === product.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-md shadow-md py-1 z-20 text-left">
                              <button
                                onClick={() => {
                                  onEditProduct(product);
                                  setMenuOpenId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>
                              <button
                                onClick={() => {
                                  onOpenMovement(product, 'AJUSTE');
                                  setMenuOpenId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <span>Ajustar Stock</span>
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer summary bar */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Mostrando <strong className="text-slate-700 font-mono">{filteredProducts.length}</strong> de <strong className="text-slate-700 font-mono">{products.length}</strong> productos
        </span>
        <span className="text-[11px] text-slate-400">
          Algoritmo FEFO activo para salidas automáticas
        </span>
      </div>
    </div>
  );
};
