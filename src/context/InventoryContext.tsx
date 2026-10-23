import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product, StockMovement, Lot, MovementType, StockAlertItem, ExpiryAlertItem } from '../types/inventory';
import { INITIAL_PRODUCTS, INITIAL_MOVEMENTS } from '../data/initialData';
import { 
  getProductTotalStock, 
  computeStockAlerts, 
  computeExpiryAlerts,
  getExpiryStatus
} from '../utils/inventoryHelpers';
import { sounds } from '../utils/audio';

interface NotificationState {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  timestamp: string;
}

interface InventoryContextType {
  products: Product[];
  movements: StockMovement[];
  stockAlerts: StockAlertItem[];
  expiryAlerts: ExpiryAlertItem[];
  totalSKUs: number;
  totalUnits: number;
  totalValuation: number;
  soundEnabled: boolean;
  toggleSound: () => void;
  liveSimulationActive: boolean;
  toggleLiveSimulation: () => void;
  notifications: NotificationState[];
  dismissNotification: (id: string) => void;
  // Core actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addLot: (productId: string, lot: Omit<Lot, 'id'>) => void;
  registerMovement: (data: {
    productId: string;
    type: MovementType;
    quantity: number;
    lotId?: string;
    newLotNumber?: string;
    newLotExpiry?: string;
    referenceDoc?: string;
    reason: string;
    user?: string;
  }) => boolean;
  decommissionExpiredLot: (productId: string, lotId: string, reason?: string) => void;
  quickReorder: (productId: string, quantity: number, lotNumber?: string, expiryDate?: string) => void;
  resetToDemoData: () => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

const STORAGE_KEY_PRODUCTS = 'kardexflow_products_v2';
const STORAGE_KEY_MOVEMENTS = 'kardexflow_movements_v2';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MOVEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [liveSimulationActive, setLiveSimulationActive] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  // Persist products
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [products]);

  // Persist movements
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(movements));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [movements]);

  const addNotification = useCallback((message: string, type: 'info' | 'warning' | 'critical' | 'success') => {
    const newNotif: NotificationState = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      message,
      type,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 7)]);

    if (type === 'critical') {
      sounds.playCriticalAlert();
    } else if (type === 'warning') {
      sounds.playWarningAlert();
    } else if (type === 'success') {
      sounds.playActionSuccess();
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      sounds.setEnabled(next);
      return next;
    });
  }, []);

  const toggleLiveSimulation = useCallback(() => {
    setLiveSimulationActive(prev => {
      const next = !prev;
      if (next) {
        addNotification('Simulador en tiempo real activado: Se procesarán eventos periódicos de salida/recepción.', 'info');
      } else {
        addNotification('Simulador en tiempo real detenido.', 'info');
      }
      return next;
    });
  }, [addNotification]);

  // Derived metrics
  const stockAlerts = useMemo(() => computeStockAlerts(products), [products]);
  const expiryAlerts = useMemo(() => computeExpiryAlerts(products), [products]);

  const totalSKUs = useMemo(() => products.length, [products]);

  const totalUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + getProductTotalStock(p), 0);
  }, [products]);

  const totalValuation = useMemo(() => {
    return products.reduce((acc, p) => {
      const stock = getProductTotalStock(p);
      return acc + (stock * p.costPrice);
    }, 0);
  }, [products]);

  // Core Actions
  const addProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newId = `prod-${Date.now().toString(36)}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      lots: productData.lots || []
    };

    setProducts(prev => [newProduct, ...prev]);
    addNotification(`Producto "${newProduct.name}" agregado al catálogo.`, 'success');
  }, [addNotification]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          updatedAt: now
        };
      }
      return p;
    }));
    addNotification('Ficha de producto actualizada.', 'success');
  }, [addNotification]);

  const deleteProduct = useCallback((id: string) => {
    const target = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    if (target) {
      addNotification(`Producto "${target.name}" eliminado del inventario.`, 'info');
    }
  }, [products, addNotification]);

  const addLot = useCallback((productId: string, lotData: Omit<Lot, 'id'>) => {
    const lotId = `lot-${Date.now().toString(36)}`;
    const newLot: Lot = {
      ...lotData,
      id: lotId
    };

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          lots: [...(p.lots || []), newLot],
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    // Register movement automatically
    const prod = products.find(p => p.id === productId);
    if (prod) {
      const prevStock = getProductTotalStock(prod);
      const newStock = prevStock + lotData.quantity;
      const newMovement: StockMovement = {
        id: `mov-${Date.now()}`,
        productId,
        productName: prod.name,
        productSku: prod.sku,
        type: 'ENTRADA',
        quantity: lotData.quantity,
        previousStock: prevStock,
        newStock: newStock,
        lotNumber: lotData.lotNumber,
        referenceDoc: 'LOTE-NUEVO',
        reason: 'Incorporación de nuevo lote',
        user: 'Operador Logístico',
        timestamp: new Date().toISOString()
      };
      setMovements(m => [newMovement, ...m]);
      addNotification(`Lote ${lotData.lotNumber} (${lotData.quantity} uds) añadido a "${prod.name}".`, 'success');
    }
  }, [products, addNotification]);

  const registerMovement = useCallback((data: {
    productId: string;
    type: MovementType;
    quantity: number;
    lotId?: string;
    newLotNumber?: string;
    newLotExpiry?: string;
    referenceDoc?: string;
    reason: string;
    user?: string;
  }): boolean => {
    const prod = products.find(p => p.id === data.productId);
    if (!prod) return false;

    const prevStock = getProductTotalStock(prod);
    const qty = Math.abs(data.quantity);
    if (qty <= 0) return false;

    let updatedLots = [...(prod.lots || [])];
    let movementLotNumber = data.newLotNumber || '';

    if (data.type === 'ENTRADA') {
      if (data.lotId) {
        // Add to existing lot
        updatedLots = updatedLots.map(l => {
          if (l.id === data.lotId) {
            movementLotNumber = l.lotNumber;
            return {
              ...l,
              quantity: l.quantity + qty
            };
          }
          return l;
        });
      } else if (data.newLotNumber && data.newLotExpiry) {
        // Create new lot
        movementLotNumber = data.newLotNumber;
        updatedLots.push({
          id: `lot-${Date.now().toString(36)}`,
          lotNumber: data.newLotNumber,
          expiryDate: data.newLotExpiry,
          quantity: qty,
          initialQuantity: qty,
          receivedDate: new Date().toISOString().split('T')[0],
          location: prod.location
        });
      } else {
        // Fallback: add to first available lot or create default
        if (updatedLots.length > 0) {
          movementLotNumber = updatedLots[0].lotNumber;
          updatedLots[0] = {
            ...updatedLots[0],
            quantity: updatedLots[0].quantity + qty
          };
        } else {
          movementLotNumber = 'LT-STD-' + new Date().getFullYear();
          updatedLots.push({
            id: `lot-${Date.now()}`,
            lotNumber: movementLotNumber,
            expiryDate: '2028-12-31',
            quantity: qty,
            initialQuantity: qty,
            receivedDate: new Date().toISOString().split('T')[0]
          });
        }
      }
    } else if (data.type === 'SALIDA') {
      if (prevStock < qty) {
        addNotification(`Stock insuficiente en "${prod.name}". Solicitado: ${qty}, Disponible: ${prevStock}.`, 'critical');
        return false;
      }

      // If specific lot chosen
      if (data.lotId) {
        const targetLot = updatedLots.find(l => l.id === data.lotId);
        if (!targetLot || targetLot.quantity < qty) {
          addNotification(`El lote seleccionado no cuenta con ${qty} unidades disponibles.`, 'warning');
          return false;
        }
        movementLotNumber = targetLot.lotNumber;
        updatedLots = updatedLots.map(l => {
          if (l.id === data.lotId) {
            return { ...l, quantity: l.quantity - qty };
          }
          return l;
        });
      } else {
        // FEFO (First Expired, First Out) automatic deduction
        let remainingToDeduct = qty;
        const sortedLots = [...updatedLots].sort((a, b) => 
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        );

        const deductedLotsSummary: string[] = [];
        const newLots = sortedLots.map(l => {
          if (remainingToDeduct <= 0 || l.quantity <= 0) return l;
          const take = Math.min(l.quantity, remainingToDeduct);
          remainingToDeduct -= take;
          deductedLotsSummary.push(`${l.lotNumber} (-${take})`);
          return {
            ...l,
            quantity: l.quantity - take
          };
        });

        updatedLots = newLots;
        movementLotNumber = deductedLotsSummary.join(', ');
      }
    } else if (data.type === 'AJUSTE') {
      // Ajuste directo
      const diff = data.quantity; // puede ser positivo o negativo
      if (data.lotId) {
        updatedLots = updatedLots.map(l => {
          if (l.id === data.lotId) {
            movementLotNumber = l.lotNumber;
            const newQ = Math.max(0, l.quantity + diff);
            return { ...l, quantity: newQ };
          }
          return l;
        });
      } else if (updatedLots.length > 0) {
        movementLotNumber = updatedLots[0].lotNumber;
        const newQ = Math.max(0, updatedLots[0].quantity + diff);
        updatedLots[0] = { ...updatedLots[0], quantity: newQ };
      }
    }

    const updatedProduct: Product = {
      ...prod,
      lots: updatedLots,
      updatedAt: new Date().toISOString()
    };

    const newStock = getProductTotalStock(updatedProduct);

    const movementRecord: StockMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productId: prod.id,
      productName: prod.name,
      productSku: prod.sku,
      type: data.type,
      quantity: qty,
      previousStock: prevStock,
      newStock,
      lotNumber: movementLotNumber,
      referenceDoc: data.referenceDoc || (data.type === 'ENTRADA' ? 'REC-MANUAL' : 'DESP-MANUAL'),
      reason: data.reason || 'Operación manual de almacén',
      user: data.user || 'Supervisor de Guardia',
      timestamp: new Date().toISOString()
    };

    setProducts(prev => prev.map(p => p.id === prod.id ? updatedProduct : p));
    setMovements(prev => [movementRecord, ...prev]);

    // Check alerts after update
    if (newStock <= prod.minStock) {
      addNotification(`Alerta: "${prod.name}" ha quedado con stock bajo (${newStock} ${prod.unit} restantes).`, 'warning');
    } else {
      addNotification(`Movimiento registrado: ${data.type} de ${qty} uds en "${prod.name}".`, 'success');
    }

    return true;
  }, [products, addNotification]);

  const decommissionExpiredLot = useCallback((productId: string, lotId: string, reason: string = 'Baja por vencimiento y merma sanitaria') => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const lot = prod.lots?.find(l => l.id === lotId);
    if (!lot || lot.quantity <= 0) return;

    const qtyToRemove = lot.quantity;
    const prevStock = getProductTotalStock(prod);

    const updatedLots = prod.lots.map(l => {
      if (l.id === lotId) {
        return { ...l, quantity: 0 };
      }
      return l;
    });

    const updatedProduct: Product = {
      ...prod,
      lots: updatedLots,
      updatedAt: new Date().toISOString()
    };

    const newStock = getProductTotalStock(updatedProduct);

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      productSku: prod.sku,
      type: 'AJUSTE',
      quantity: qtyToRemove,
      previousStock: prevStock,
      newStock,
      lotNumber: lot.lotNumber,
      referenceDoc: 'ACTA-DECOMISO',
      reason,
      user: 'Control Sanitario / Calidad',
      timestamp: new Date().toISOString()
    };

    setProducts(prev => prev.map(p => p.id === prod.id ? updatedProduct : p));
    setMovements(prev => [movement, ...prev]);
    addNotification(`Se dieron de baja ${qtyToRemove} unidades vencidas del lote ${lot.lotNumber}.`, 'warning');
  }, [products, addNotification]);

  const quickReorder = useCallback((productId: string, quantity: number, lotNumber?: string, expiryDate?: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const lotNum = lotNumber || `LT-REORD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    // Default expiry 18 months in future
    const expDate = expiryDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 540).toISOString().split('T')[0];

    registerMovement({
      productId,
      type: 'ENTRADA',
      quantity,
      newLotNumber: lotNum,
      newLotExpiry: expDate,
      referenceDoc: `OC-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      reason: 'Reabastecimiento automático por alerta de stock',
      user: 'Compras Automáticas'
    });
  }, [products, registerMovement]);

  const resetToDemoData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setMovements(INITIAL_MOVEMENTS);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_MOVEMENTS);
    addNotification('Datos de catálogo y movimientos restaurados a la configuración inicial.', 'info');
  }, [addNotification]);

  // Real-time live simulation ticker (when enabled)
  useEffect(() => {
    if (!liveSimulationActive) return;

    const interval = setInterval(() => {
      // Pick random product with stock
      const candidates = products.filter(p => getProductTotalStock(p) > 5);
      if (candidates.length === 0) return;

      const randomProd = candidates[Math.floor(Math.random() * candidates.length)];
      const isSale = Math.random() > 0.3; // 70% sale/outflow, 30% restock
      const simQty = Math.floor(1 + Math.random() * 4);

      if (isSale) {
        registerMovement({
          productId: randomProd.id,
          type: 'SALIDA',
          quantity: simQty,
          referenceDoc: `POS-TICKET-${Math.floor(1000 + Math.random() * 9000)}`,
          reason: 'Venta en mostrador / Simulación en tiempo real',
          user: 'Caja Punto de Venta'
        });
      } else {
        const nextYearDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().split('T')[0];
        registerMovement({
          productId: randomProd.id,
          type: 'ENTRADA',
          quantity: simQty * 2,
          newLotNumber: `LT-SIM-${Math.floor(100 + Math.random() * 900)}`,
          newLotExpiry: nextYearDate,
          referenceDoc: `REC-PROV-${Math.floor(1000 + Math.random() * 9000)}`,
          reason: 'Recepción programada / Simulación en tiempo real',
          user: 'Muelle de Carga'
        });
      }
    }, 14000);

    return () => clearInterval(interval);
  }, [liveSimulationActive, products, registerMovement]);

  const value = {
    products,
    movements,
    stockAlerts,
    expiryAlerts,
    totalSKUs,
    totalUnits,
    totalValuation,
    soundEnabled,
    toggleSound,
    liveSimulationActive,
    toggleLiveSimulation,
    notifications,
    dismissNotification,
    addProduct,
    updateProduct,
    deleteProduct,
    addLot,
    registerMovement,
    decommissionExpiredLot,
    quickReorder,
    resetToDemoData
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
