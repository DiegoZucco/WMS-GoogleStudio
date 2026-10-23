import { Product, StockMovement } from '../types/inventory';

// Base date context: 2026-10-23
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'MED-AMX-500',
    barcode: '7790123450012',
    name: 'Amoxicilina 500mg (Caja x 30)',
    category: 'Farmacia y Salud',
    unit: 'Cajas',
    minStock: 40,
    reorderPoint: 60,
    maxStock: 200,
    costPrice: 4.80,
    salePrice: 9.50,
    location: 'Estante A-02 / Almacén Central',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-10-22T14:30:00Z',
    lots: [
      {
        id: 'lot-amx-01',
        lotNumber: 'LT-2025-88A',
        expiryDate: '2026-10-12', // VENCIDO (hace 11 días)
        quantity: 8,
        initialQuantity: 50,
        receivedDate: '2025-10-15',
        location: 'Estante A-02'
      },
      {
        id: 'lot-amx-02',
        lotNumber: 'LT-2026-04B',
        expiryDate: '2026-11-05', // CRÍTICO: Vence en 13 días
        quantity: 14,
        initialQuantity: 60,
        receivedDate: '2026-02-10',
        location: 'Estante A-02'
      }
    ]
  },
  {
    id: 'prod-002',
    sku: 'MED-PAR-1G',
    barcode: '7790123450029',
    name: 'Paracetamol 1g Comprimidos (Caja x 20)',
    category: 'Farmacia y Salud',
    unit: 'Cajas',
    minStock: 50,
    reorderPoint: 80,
    maxStock: 300,
    costPrice: 2.10,
    salePrice: 4.90,
    location: 'Estante A-04 / Almacén Central',
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-10-20T11:15:00Z',
    lots: [
      {
        id: 'lot-par-01',
        lotNumber: 'LT-2026-PAR1',
        expiryDate: '2027-08-30', // VIGENTE
        quantity: 110,
        initialQuantity: 150,
        receivedDate: '2026-04-12',
        location: 'Estante A-04'
      }
    ]
  },
  {
    id: 'prod-003',
    sku: 'ALI-LAC-UHT',
    barcode: '7790123450036',
    name: 'Leche Deslactosada UHT 1 Litro',
    category: 'Alimentos y Bebidas',
    unit: 'Litros',
    minStock: 60,
    reorderPoint: 100,
    maxStock: 400,
    costPrice: 0.95,
    salePrice: 1.85,
    location: 'Cámara Fría B-01',
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-10-23T09:00:00Z',
    lots: [
      {
        id: 'lot-lac-01',
        lotNumber: 'LT-LAK-993',
        expiryDate: '2026-11-02', // CRÍTICO: Vence en 10 días
        quantity: 22,
        initialQuantity: 120,
        receivedDate: '2026-05-01',
        location: 'Cámara Fría B-01'
      },
      {
        id: 'lot-lac-02',
        lotNumber: 'LT-LAK-1044',
        expiryDate: '2026-12-15', // PROXIMO (53 días)
        quantity: 95,
        initialQuantity: 100,
        receivedDate: '2026-07-20',
        location: 'Cámara Fría B-01'
      }
    ]
  },
  {
    id: 'prod-004',
    sku: 'ALI-CAF-ESP',
    barcode: '7790123450043',
    name: 'Café Grano Tostado Especialidad 1Kg',
    category: 'Alimentos y Bebidas',
    unit: 'Kilogramos',
    minStock: 25,
    reorderPoint: 40,
    maxStock: 150,
    costPrice: 12.00,
    salePrice: 24.50,
    location: 'Depósito Seco C-03',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-10-18T16:20:00Z',
    lots: [
      {
        id: 'lot-caf-01',
        lotNumber: 'LT-CAF-COL-25',
        expiryDate: '2026-09-30', // VENCIDO (hace 23 días)
        quantity: 5,
        initialQuantity: 40,
        receivedDate: '2025-10-01',
        location: 'Depósito Seco C-03'
      },
      {
        id: 'lot-caf-02',
        lotNumber: 'LT-CAF-BRA-26',
        expiryDate: '2027-03-31', // VIGENTE
        quantity: 38,
        initialQuantity: 50,
        receivedDate: '2026-04-10',
        location: 'Depósito Seco C-03'
      }
    ]
  },
  {
    id: 'prod-005',
    sku: 'QUI-ALC-70',
    barcode: '7790123450050',
    name: 'Alcohol Etílico 70% Grado Hospitalario (5L)',
    category: 'Químicos y Laboratorio',
    unit: 'Bidones',
    minStock: 30,
    reorderPoint: 50,
    maxStock: 200,
    costPrice: 6.50,
    salePrice: 13.90,
    location: 'Depósito Químicos Q-01',
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-10-21T10:00:00Z',
    lots: [
      {
        id: 'lot-alc-01',
        lotNumber: 'LT-ALC-70-26A',
        expiryDate: '2026-11-18', // Vence en 26 días (Próximo)
        quantity: 18,
        initialQuantity: 60,
        receivedDate: '2026-01-25',
        location: 'Depósito Químicos Q-01'
      }
    ]
  },
  {
    id: 'prod-006',
    sku: 'INS-GUA-NIT',
    barcode: '7790123450067',
    name: 'Guantes Nitrilo Quirúrgicos Talle M (Caja x 100)',
    category: 'Farmacia y Salud',
    unit: 'Cajas',
    minStock: 80,
    reorderPoint: 120,
    maxStock: 500,
    costPrice: 5.20,
    salePrice: 9.80,
    location: 'Estante M-12 / Almacén Central',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-10-23T11:45:00Z',
    lots: [
      {
        id: 'lot-gua-01',
        lotNumber: 'LT-NIT-2026-09',
        expiryDate: '2029-05-10', // VIGENTE A LARGO PLAZO
        quantity: 45, // STOCK BAJO (45 vs minStock 80)
        initialQuantity: 150,
        receivedDate: '2026-06-05',
        location: 'Estante M-12'
      }
    ]
  },
  {
    id: 'prod-007',
    sku: 'TEC-SEN-IR',
    barcode: '7790123450074',
    name: 'Sensor Infrarrojo Óptico Industrial 24V',
    category: 'Tecnología y Repuestos',
    unit: 'Unidades',
    minStock: 15,
    reorderPoint: 25,
    maxStock: 80,
    costPrice: 28.00,
    salePrice: 54.00,
    location: 'Gabinete Electrónica E-05',
    createdAt: '2026-04-10T08:30:00Z',
    updatedAt: '2026-10-23T12:00:00Z',
    lots: [
      {
        id: 'lot-sen-01',
        lotNumber: 'LT-SEN-IR-2026',
        expiryDate: '2030-12-31', // No perecedero rápido
        quantity: 8, // STOCK CRÍTICO (8 vs minStock 15)
        initialQuantity: 30,
        receivedDate: '2026-05-15',
        location: 'Gabinete E-05'
      }
    ]
  },
  {
    id: 'prod-008',
    sku: 'INS-FIL-N95',
    barcode: '7790123450081',
    name: 'Mascarilla Respirador N95 Partículas (Caja x 20)',
    category: 'Insumos Industriales',
    unit: 'Cajas',
    minStock: 35,
    reorderPoint: 60,
    maxStock: 250,
    costPrice: 8.50,
    salePrice: 16.50,
    location: 'Estante Seguridad S-03',
    createdAt: '2026-03-25T11:00:00Z',
    updatedAt: '2026-10-22T17:10:00Z',
    lots: [
      {
        id: 'lot-fil-01',
        lotNumber: 'LT-N95-2026',
        expiryDate: '2027-11-30',
        quantity: 85,
        initialQuantity: 100,
        receivedDate: '2026-07-01',
        location: 'Estante S-03'
      }
    ]
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-001',
    productId: 'prod-001',
    productName: 'Amoxicilina 500mg (Caja x 30)',
    productSku: 'MED-AMX-500',
    type: 'SALIDA',
    quantity: 10,
    previousStock: 32,
    newStock: 22,
    lotNumber: 'LT-2026-04B',
    referenceDoc: 'FAC-2026-8841',
    reason: 'Despacho a Farmacia Sucursal Norte',
    user: 'D. Zuccolilli',
    timestamp: '2026-10-23T11:15:00Z'
  },
  {
    id: 'mov-002',
    productId: 'prod-003',
    productName: 'Leche Deslactosada UHT 1 Litro',
    productSku: 'ALI-LAC-UHT',
    type: 'SALIDA',
    quantity: 15,
    previousStock: 132,
    newStock: 117,
    lotNumber: 'LT-LAK-993',
    referenceDoc: 'REM-44910',
    reason: 'Venta institucional / Despacho FEFO',
    user: 'M. Gomez (Logística)',
    timestamp: '2026-10-23T09:00:00Z'
  },
  {
    id: 'mov-003',
    productId: 'prod-006',
    productName: 'Guantes Nitrilo Quirúrgicos Talle M (Caja x 100)',
    productSku: 'INS-GUA-NIT',
    type: 'SALIDA',
    quantity: 25,
    previousStock: 70,
    newStock: 45,
    lotNumber: 'LT-NIT-2026-09',
    referenceDoc: 'DESP-9921',
    reason: 'Consumo interno Laboratorio Central',
    user: 'D. Zuccolilli',
    timestamp: '2026-10-22T16:40:00Z'
  },
  {
    id: 'mov-004',
    productId: 'prod-002',
    productName: 'Paracetamol 1g Comprimidos (Caja x 20)',
    productSku: 'MED-PAR-1G',
    type: 'ENTRADA',
    quantity: 50,
    previousStock: 60,
    newStock: 110,
    lotNumber: 'LT-2026-PAR1',
    referenceDoc: 'OC-2026-1182',
    reason: 'Recepción de Proveedor Lab FarmaSur',
    user: 'Control Calidad',
    timestamp: '2026-10-20T11:15:00Z'
  }
];
