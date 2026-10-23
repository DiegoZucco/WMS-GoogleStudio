import { Product, Lot, StockStatus, ExpiryStatus, StockAlertItem, ExpiryAlertItem } from '../types/inventory';

// Reference date fallback to current browser date
export const getCurrentDate = (): Date => {
  return new Date();
};

export const getDaysRemaining = (expiryDateStr: string, referenceDate: Date = getCurrentDate()): number => {
  if (!expiryDateStr) return 9999;
  const expiry = new Date(expiryDateStr + 'T00:00:00');
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (expiryDateStr: string, referenceDate: Date = getCurrentDate()): { status: ExpiryStatus; daysRemaining: number } => {
  if (!expiryDateStr) return { status: 'SIN_FECHA', daysRemaining: 9999 };
  const days = getDaysRemaining(expiryDateStr, referenceDate);

  if (days < 0) return { status: 'VENCIDO', daysRemaining: days };
  if (days <= 15) return { status: 'CRITICO_15D', daysRemaining: days };
  if (days <= 45) return { status: 'PROXIMO_30D', daysRemaining: days };
  return { status: 'VIGENTE', daysRemaining: days };
};

export const getProductTotalStock = (product: Product): number => {
  if (!product.lots || product.lots.length === 0) return 0;
  return product.lots.reduce((acc, lot) => acc + (lot.quantity || 0), 0);
};

export const getProductStockStatus = (product: Product): StockStatus => {
  const current = getProductTotalStock(product);
  if (current <= 0 || current <= product.minStock * 0.4) {
    return 'CRITICO';
  }
  if (current <= product.minStock) {
    return 'BAJO';
  }
  if (product.maxStock && current > product.maxStock) {
    return 'SOBRESTOCK';
  }
  return 'OPTIMO';
};

export const getProductNearestExpiry = (product: Product, referenceDate: Date = getCurrentDate()): {
  lot: Lot | null;
  daysRemaining: number;
  status: ExpiryStatus;
} => {
  if (!product.lots || product.lots.length === 0) {
    return { lot: null, daysRemaining: 9999, status: 'SIN_FECHA' };
  }

  // Filter lots with remaining quantity
  const activeLots = product.lots.filter(l => l.quantity > 0);
  if (activeLots.length === 0) {
    return { lot: null, daysRemaining: 9999, status: 'SIN_FECHA' };
  }

  // Sort by expiry date ascending
  const sortedLots = [...activeLots].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  const nearest = sortedLots[0];
  const { status, daysRemaining } = getExpiryStatus(nearest.expiryDate, referenceDate);

  return { lot: nearest, daysRemaining, status };
};

export const computeStockAlerts = (products: Product[]): StockAlertItem[] => {
  const alerts: StockAlertItem[] = [];

  products.forEach(p => {
    const total = getProductTotalStock(p);
    const status = getProductStockStatus(p);

    if (status === 'CRITICO' || status === 'BAJO') {
      const suggestedReorder = Math.max(
        (p.reorderPoint || p.minStock * 1.5) - total,
        p.minStock - total
      );

      alerts.push({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        category: p.category,
        currentStock: total,
        minStock: p.minStock,
        reorderPoint: p.reorderPoint,
        suggestedReorderQty: Math.max(1, Math.ceil(suggestedReorder)),
        status
      });
    }
  });

  // Sort critical first
  return alerts.sort((a, b) => {
    if (a.status === 'CRITICO' && b.status !== 'CRITICO') return -1;
    if (b.status === 'CRITICO' && a.status !== 'CRITICO') return 1;
    return (a.currentStock / a.minStock) - (b.currentStock / b.minStock);
  });
};

export const computeExpiryAlerts = (products: Product[], referenceDate: Date = getCurrentDate()): ExpiryAlertItem[] => {
  const alerts: ExpiryAlertItem[] = [];

  products.forEach(p => {
    (p.lots || []).forEach(lot => {
      if (lot.quantity > 0) {
        const { status, daysRemaining } = getExpiryStatus(lot.expiryDate, referenceDate);
        if (status === 'VENCIDO' || status === 'CRITICO_15D' || status === 'PROXIMO_30D') {
          alerts.push({
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            category: p.category,
            lotId: lot.id,
            lotNumber: lot.lotNumber,
            expiryDate: lot.expiryDate,
            quantity: lot.quantity,
            daysRemaining,
            status
          });
        }
      }
    });
  });

  // Sort by urgency: expired first (most negative), then nearest to expire
  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
};

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(val);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateStr;
  }
};
