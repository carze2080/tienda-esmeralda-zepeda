export type ProductCategory = 
  | 'Vestidos' 
  | 'Blusas y Tops' 
  | 'Blazers y Sacos' 
  | 'Pantalones' 
  | 'Faldas' 
  | 'Conjuntos' 
  | 'Accesorios' 
  | 'Calzado';

export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Unitalla';

export interface ProductVariant {
  size: ClothingSize;
  color: string;
  stock: number;
  sku: string;
}

export interface CostBreakdown {
  baseCost: number;        // Costo de compra o tela/confección
  laborCost: number;       // Mano de obra / arreglos
  packagingCost: number;   // Empaque premium, listón, aroma
  shippingCost: number;    // Envío / flete prorrateado
  otherExpenses: number;   // Comisiones u otros gastos
  marginPercentage: number;// % de ganancia deseado (ej. 50%)
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  description: string;
  imageUrl?: string;
  costBreakdown: CostBreakdown;
  totalCost: number;       // Suma de costos
  profitAmount: number;    // Ganancia en dinero
  sellingPrice: number;    // Precio de venta al público
  variants: ProductVariant[];
  totalStock: number;
  featured?: boolean;
  createdAt: string;
}

export type OrderStatus = 'nuevo' | 'en_proceso' | 'listo' | 'entregado' | 'cancelado';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'contra_entrega';

export interface OrderItem {
  productId: string;
  productName: string;
  size: ClothingSize;
  color: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  totalPrice: number;
  totalCost: number;
  sku: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  rfc?: string;
  address?: string;
  fiscalName?: string;
  cfdiUsage?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;       // IVA
  total: number;
  totalCost: number;
  profit: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  notes?: string;
  invoiceId?: string;      // ID de factura electrónica vinculada
  isOnlineOrder?: boolean; // Realizado por cliente desde la tienda web
}

export interface ElectronicInvoice {
  id: string;
  invoiceNumber: string;   // Serie y folio ej. EZ-00104
  uuid: string;            // Folio fiscal digital (SAT / Autoridad)
  orderId: string;
  orderNumber: string;
  issueDate: string;
  issuer: {
    businessName: string;
    tradeName: string;
    ownerName: string;
    rfc: string;
    fiscalRegime: string;
    address: string;
    phone: string;
    email: string;
    digitalStamp: string;
    certificateNumber: string;
  };
  receiver: {
    name: string;
    rfc: string;
    fiscalRegime?: string;
    cfdiUsage: string;
    email?: string;
    address?: string;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    size: string;
    color: string;
    satProductCode: string;
    unitMeasure: string;
  }[];
  subtotal: number;
  taxRate: number;         // 16% IVA
  taxAmount: number;
  total: number;
  paymentMethod: string;
  paymentType: string;
  currency: string;
  satStamp: string;
  originalChain: string;
  qrCodeUrl: string;
  status: 'vigente' | 'cancelada';
}

export interface BoutiqueProfile {
  name: string;
  ownerName: string;
  tagline: string;
  rfc: string;
  fiscalRegime: string;
  phone: string;
  whatsapp: string;
  address: string;
  taxRate: number; // 0.16 para 16%
  currency: string;
  currencySymbol: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  logoUrl: string;
  avatarUrl: string;
  heroBannerUrl: string;
}
