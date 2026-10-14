import { Product, Order, ElectronicInvoice, BoutiqueProfile, CostBreakdown } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'ez_boutique_products_clean_v2',
  ORDERS: 'ez_boutique_orders_clean_v2',
  INVOICES: 'ez_boutique_invoices_clean_v2',
  PROFILE: 'ez_boutique_profile_clean_v2',
};

export const AVAILABLE_LOGOS = [
  {
    id: 'aura_gold',
    name: 'AURA Silueta Dorada (Pelo Rizado & Oro)',
    url: '/src/assets/images/new_esmeralda_logo_1792000580370.jpg',
    description: 'Silueta minimalista dorada con rizos voluptuosos de alta costura.',
  },
  {
    id: 'ez_atelier',
    name: 'EZ Atelier Monograma (Verde Esmeralda & Oro)',
    url: '/src/assets/images/atelier_esmeralda_logo_1792000598373.jpg',
    description: 'Monograma entrelazado EZ con filigrana dorada y estilo parisino.',
  },
  {
    id: 'ez_portrait',
    name: 'Esmeralda Clásica (Emblema Circular)',
    url: '/src/assets/images/esmeralda_logo_1791936785380.jpg',
    description: 'Sello circular con silueta verde esmeralda y marco dorado.',
  },
];

export const SUGGESTED_NAMES = [
  'AURA by Esmeralda Zepeda',
  'Esmeralda Atelier Boutique',
  'Zepeda Alta Costura',
  'Émeraude Moda & Rizos',
  'Esmeralda Zepeda Haute Couture',
  'Rêve & Esmeralda Studio',
];

export const DEFAULT_PROFILE: BoutiqueProfile = {
  name: 'AURA by Esmeralda Zepeda',
  ownerName: 'Esmeralda Zepeda',
  tagline: 'Alta Costura & Moda Femenina',
  rfc: 'ZEPE910412-EZ8',
  fiscalRegime: '626 - Régimen Simplificado de Confianza (RESICO)',
  phone: '+52 33 2189 7460',
  whatsapp: '+52 33 2189 7460',
  address: 'Av. de las Rosas 1450, Col. Chapalita, Guadalajara, Jal.',
  taxRate: 0.16, // 16% IVA
  currency: 'MXN',
  currencySymbol: '$',
  soundEnabled: true,
  vibrationEnabled: true,
  logoUrl: '/src/assets/images/new_esmeralda_logo_1792000580370.jpg',
  avatarUrl: '/src/assets/images/esmeralda_avatar_1791936786009.jpg',
  heroBannerUrl: '/src/assets/images/boutique_hero_1791936786205.jpg',
};

export function calculatePricingFromCost(breakdown: CostBreakdown): {
  totalCost: number;
  profitAmount: number;
  sellingPrice: number;
} {
  const totalCost = 
    (breakdown.baseCost || 0) +
    (breakdown.laborCost || 0) +
    (breakdown.packagingCost || 0) +
    (breakdown.shippingCost || 0) +
    (breakdown.otherExpenses || 0);

  const marginPct = breakdown.marginPercentage || 50;
  const profitAmount = totalCost * (marginPct / 100);
  const rawPrice = totalCost + profitAmount;
  const sellingPrice = Math.round(rawPrice);

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    profitAmount: Math.round(profitAmount * 100) / 100,
    sellingPrice,
  };
}

// Clean initial empty state for Esmeralda to start fresh!
export const INITIAL_PRODUCTS: Product[] = [];

export function getStoredProfile(): BoutiqueProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: BoutiqueProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

export function saveStoredOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

export function getStoredInvoices(): ElectronicInvoice[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

export function saveStoredInvoices(invoices: ElectronicInvoice[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
}

// Clears all stored data in LocalStorage completely
export function clearAllLocalBoutiqueData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
  // Clear any legacy keys too
  localStorage.removeItem('ez_boutique_products_v1');
  localStorage.removeItem('ez_boutique_orders_v1');
  localStorage.removeItem('ez_boutique_invoices_v1');
}
