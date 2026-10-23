export type MovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'TRANSFERENCIA';

export interface Lot {
  id: string;
  lotNumber: string;
  expiryDate: string; // YYYY-MM-DD
  quantity: number;
  initialQuantity: number;
  receivedDate: string;
  location?: string;
}

export type Category = 
  | 'Farmacia y Salud'
  | 'Alimentos y Bebidas'
  | 'Insumos Industriales'
  | 'Químicos y Laboratorio'
  | 'Tecnología y Repuestos'
  | 'General';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: Category;
  unit: string; // ej: "Cajas", "Unidades", "Litros", "Kilogramos"
  minStock: number;
  reorderPoint: number;
  maxStock: number;
  costPrice: number;
  salePrice: number;
  location: string;
  lots: Lot[];
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  lotNumber?: string;
  referenceDoc?: string; // N° de factura, remito, orden de compra o despacho
  reason: string;
  user: string;
  timestamp: string;
}

export type StockStatus = 'CRITICO' | 'BAJO' | 'OPTIMO' | 'SOBRESTOCK';
export type ExpiryStatus = 'VENCIDO' | 'CRITICO_15D' | 'PROXIMO_30D' | 'VIGENTE' | 'SIN_FECHA';

export interface ExpiryAlertItem {
  productId: string;
  productName: string;
  sku: string;
  category: Category;
  lotId: string;
  lotNumber: string;
  expiryDate: string;
  quantity: number;
  daysRemaining: number;
  status: ExpiryStatus;
}

export interface StockAlertItem {
  productId: string;
  productName: string;
  sku: string;
  category: Category;
  currentStock: number;
  minStock: number;
  reorderPoint: number;
  suggestedReorderQty: number;
  status: StockStatus;
}
