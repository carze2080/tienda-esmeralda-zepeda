import React, { useState } from 'react';
import { Product, ClothingSize, OrderItem, CustomerInfo, BoutiqueProfile, Order, ElectronicInvoice, ProductCategory } from '../types';
import { 
  ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle2, 
  MapPin, Phone, MessageCircle, ArrowRight, Sparkles, Heart, 
  ShieldCheck, X, Truck, CreditCard, Banknote, Clock, PackageCheck,
  ChevronRight, Lock, ExternalLink, ArrowLeft, RefreshCw, AlertCircle
} from 'lucide-react';
import { formatUSD, formatUSDCompact } from '../utils/currency';

interface CustomerPortalProps {
  products: Product[];
  orders: Order[];
  invoices: ElectronicInvoice[];
  profile: BoutiqueProfile;
  onSwitchToOwner: () => void;
  onSubmitOrder: (customer: CustomerInfo, items: OrderItem[], paymentMethod: any, notes?: string) => void;
  onViewInvoice: (invoice: ElectronicInvoice) => void;
  onLoadSampleProducts?: () => void;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'Todas las Prendas', value: 'todos' },
  { label: 'Vestidos', value: 'Vestidos' },
  { label: 'Blusas y Tops', value: 'Blusas y Tops' },
  { label: 'Blazers y Sacos', value: 'Blazers y Sacos' },
  { label: 'Pantalones', value: 'Pantalones' },
  { label: 'Faldas', value: 'Faldas' },
  { label: 'Conjuntos', value: 'Conjuntos' },
  { label: 'Accesorios', value: 'Accesorios' },
  { label: 'Calzado', value: 'Calzado' },
];

const SIZES: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'Unitalla'];

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  products,
  orders,
  invoices,
  profile,
  onSwitchToOwner,
  onSubmitOrder,
  onViewInvoice,
  onLoadSampleProducts,
}) => {
  // Navigation & filters
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedSize, setSelectedSize] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Cart state
  const [cart, setCart] = useState<{
    product: Product;
    size: ClothingSize;
    color: string;
    quantity: number;
  }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Quick size selection modal for products
  const [selectedProductForCart, setSelectedProductForCart] = useState<Product | null>(null);
  const [chosenSize, setChosenSize] = useState<ClothingSize>('S');

  // Checkout form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'envio' | 'recogida'>('envio');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'zelle' | 'efectivo' | 'tarjeta'>('zelle');

  // Order success confirmation modal
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Order Tracking Modal
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackedOrders, setTrackedOrders] = useState<Order[] | null>(null);

  // Filter products for client
  const availableProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSize = 
      selectedSize === 'todos' || 
      p.variants.some((v) => v.size === selectedSize && v.stock > 0);

    return matchesCategory && matchesSearch && matchesSize && p.totalStock > 0;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add to cart handler
  const handleAddToCart = (product: Product, size: ClothingSize) => {
    const variant = product.variants.find((v) => v.size === size);
    const color = variant?.color || 'Color Único';

    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id && i.size === size);
      if (idx >= 0) {
        const next = [...prev];
        const currentQty = next[idx].quantity;
        const maxStock = variant?.stock || 99;
        if (currentQty < maxStock) {
          next[idx].quantity += 1;
        }
        return next;
      }
      return [...prev, { product, size, color, quantity: 1 }];
    });

    setSelectedProductForCart(null);
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, size: ClothingSize, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.size === size) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as {
          product: Product;
          size: ClothingSize;
          color: string;
          quantity: number;
        }[]
    );
  };

  const handleRemoveFromCart = (productId: string, size: ClothingSize) => {
    setCart((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  };

  // Submit client order
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !customerName.trim() || !customerPhone.trim()) return;

    const orderItems: OrderItem[] = cart.map((c) => {
      const variant = c.product.variants.find((v) => v.size === c.size);
      return {
        productId: c.product.id,
        productName: c.product.name,
        size: c.size,
        color: c.color,
        quantity: c.quantity,
        unitCost: c.product.totalCost,
        unitPrice: c.product.sellingPrice,
        totalCost: c.product.totalCost * c.quantity,
        totalPrice: c.product.sellingPrice * c.quantity,
        sku: variant?.sku || `${c.product.sku}-${c.size}`,
      };
    });

    const fullNotes = [
      deliveryType === 'envio' ? `Envío a domicilio: ${customerAddress}` : 'Recoger en Boutique',
      customerNotes ? `Nota: ${customerNotes}` : null,
      `Método de pago elegido: ${paymentMethod.toUpperCase()}`
    ].filter(Boolean).join(' • ');

    const customer: CustomerInfo = {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      address: deliveryType === 'envio' ? customerAddress.trim() : 'Recoger en Boutique',
      rfc: 'XAXX010101000',
      cfdiUsage: 'S01 - Sin efectos fiscales',
    };

    const paymentTypeMapped = paymentMethod === 'efectivo' 
      ? 'contra_entrega' 
      : paymentMethod === 'tarjeta' 
        ? 'tarjeta' 
        : 'transferencia';

    // Submit order to owner app
    onSubmitOrder(customer, orderItems, paymentTypeMapped, fullNotes);

    // Create confirmation object
    const createdOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      customer,
      items: orderItems,
      subtotal: cartTotal / (1 + profile.taxRate),
      taxAmount: cartTotal - (cartTotal / (1 + profile.taxRate)),
      total: cartTotal,
      totalCost: orderItems.reduce((acc, it) => acc + it.totalCost, 0),
      profit: cartTotal - orderItems.reduce((acc, it) => acc + it.totalCost, 0),
      paymentMethod: paymentTypeMapped,
      status: 'nuevo',
      notes: fullNotes,
      isOnlineOrder: true,
    };

    setCompletedOrder(createdOrder);
    setCart([]);
    setIsCartOpen(false);
  };

  // WhatsApp confirmation message
  const handleSendWhatsAppOrder = (order: Order) => {
    const cleanPhone = profile.whatsapp.replace(/[^0-9]/g, '') || '15553457890';
    const itemsList = order.items
      .map((it) => `• ${it.quantity}x ${it.productName} (Talla ${it.size}) - ${formatUSD(it.totalPrice)}`)
      .join('\n');

    const text = encodeURIComponent(
      `¡Hola Esmeralda! ✨ Acabo de realizar un pedido en la tienda online *${profile.name}*:\n\n` +
      `👗 *Pedido:* ${order.orderNumber}\n` +
      `👤 *Cliente:* ${order.customer.name}\n` +
      `📱 *Teléfono:* ${order.customer.phone}\n` +
      `📍 *Dirección/Entrega:* ${order.customer.address || 'Recoger en Boutique'}\n\n` +
      `🛍️ *Prendas seleccionadas:*\n${itemsList}\n\n` +
      `💰 *Total a pagar:* ${formatUSD(order.total)}\n` +
      `💳 *Forma de pago:* ${order.paymentMethod.toUpperCase()}\n\n` +
      `¿Podrías confirmarme la disponibilidad y tiempo de entrega? ¡Muchas gracias!`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Tracking search
  const handleSearchTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingQuery.trim()) return;
    const cleanQ = trackingQuery.trim().toLowerCase();
    const results = orders.filter((o) => {
      const matchNum = o.orderNumber.toLowerCase().includes(cleanQ);
      const matchPhone = o.customer.phone.replace(/[^0-9]/g, '').includes(cleanQ.replace(/[^0-9]/g, ''));
      const matchName = o.customer.name.toLowerCase().includes(cleanQ);
      return matchNum || matchPhone || matchName;
    });
    setTrackedOrders(results);
  };

  const getOrderStatusDisplay = (status: string) => {
    switch (status) {
      case 'nuevo':
        return { label: 'Pedido Recibido', color: 'bg-amber-100 text-amber-900 border-amber-300', step: 1 };
      case 'en_proceso':
        return { label: 'En Preparación / Taller', color: 'bg-blue-100 text-blue-900 border-blue-300', step: 2 };
      case 'listo':
        return { label: 'Listo para Entrega / Envío', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', step: 3 };
      case 'entregado':
        return { label: 'Entregado con Éxito', color: 'bg-emerald-700 text-white border-emerald-800', step: 4 };
      default:
        return { label: status, color: 'bg-stone-200 text-stone-800 border-stone-300', step: 1 };
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-amber-200 selection:text-amber-950">
      {/* Top Banner Notice: Currency USD */}
      <div className="bg-stone-950 text-amber-300 text-[11px] sm:text-xs py-1.5 px-3 border-b border-amber-500/30 flex items-center justify-between">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Tienda Oficial Online • Todos los precios en <strong>Dólares Estadounidenses (USD)</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTrackingOpen(true)}
              className="hover:underline flex items-center gap-1 text-stone-300 hover:text-white cursor-pointer"
            >
              <PackageCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Rastrear Pedido</span>
            </button>

            {/* Switch to Owner Portal */}
            <button
              onClick={onSwitchToOwner}
              title="Cambiar al portal de administración y finanzas de la dueña"
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              <span>Portal de la Dueña</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Luxury Client Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <img
              src={profile.logoUrl}
              alt="Logo Esme Closet"
              referrerPolicy="no-referrer"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-amber-400 shadow-md bg-stone-950 shrink-0"
            />
            <div>
              <h1 className="font-serif text-lg sm:text-2xl font-bold tracking-wide text-stone-900 leading-tight">
                {profile.name}
              </h1>
              <p className="text-xs text-stone-500 font-medium hidden sm:block">
                {profile.tagline} • Por <span className="text-emerald-700 font-semibold">{profile.ownerName}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct WhatsApp Contact */}
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('¡Hola Esmeralda! Me encantan las prendas de Esme Closet. ¿Podrías darme más información?')}`}
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Boutique</span>
            </a>

            {/* Track Order button */}
            <button
              onClick={() => setIsTrackingOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <PackageCheck className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Mis Pedidos</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Bolsa</span>
              {cartItemsCount > 0 && (
                <span className="bg-amber-400 text-stone-950 font-black text-xs px-2 py-0.5 rounded-full shadow-sm">
                  {cartItemsCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="hidden sm:inline text-amber-200 font-mono text-xs">
                  • {formatUSDCompact(cartTotal)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Showcase Section */}
      <section className="relative bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900 text-stone-100 py-8 sm:py-12 px-4 border-b border-amber-500/20 overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Colección Exclusiva de Alta Confección</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Moda Textil Exclusiva y Elegancia Personal
            </h2>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
              Descubre las prendas confeccionadas con los más altos estándares textiles. Precios transparentes y fijados en <strong>Dólares Estadounidenses (USD)</strong> con envíos garantizados.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-stone-300">
              <span className="flex items-center gap-1.5 bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-800">
                <Truck className="w-4 h-4 text-amber-400" /> Envíos Rápidos & Seguros
              </span>
              <span className="flex items-center gap-1.5 bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Factura / Recibo Electrónico
              </span>
              <span className="flex items-center gap-1.5 bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-800">
                <Heart className="w-4 h-4 text-rose-400" /> Atención por Esmeralda Zepeda
              </span>
            </div>
          </div>

          {/* Banner Boutique Visual */}
          <div className="w-full max-w-sm shrink-0">
            <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/50 shadow-2xl bg-stone-900 aspect-[4/3]">
              <img
                src={profile.heroBannerUrl}
                alt="Showroom Esme Closet"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent flex items-end p-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">Atelier Esme Closet</span>
                  <p className="text-sm font-serif font-bold text-white">Prendas con acabados de alta costura</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-white border-b border-stone-200 sticky top-[73px] z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
          {/* Search and Size filter row */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar vestidos, blusas, blazers, conjuntos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-700 focus:bg-white transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Size Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-stone-500 whitespace-nowrap">Talla:</span>
              <button
                onClick={() => setSelectedSize('todos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedSize === 'todos'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Todas
              </button>
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedSize === size
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Catalog Products Section */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              {selectedCategory === 'todos' ? 'Prendas Disponibles' : selectedCategory}
            </h3>
            <p className="text-xs text-stone-500">
              {availableProducts.length} prenda{availableProducts.length === 1 ? '' : 's'} en catálogo • Precios en <strong>Dólares Estadounidenses (USD)</strong>
            </p>
          </div>

          {/* Currency indicator badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 rounded-full text-xs font-bold text-amber-900">
            <span>💵 USD $</span>
          </div>
        </div>

        {/* Empty Catalog State */}
        {availableProducts.length === 0 && (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8 text-amber-700" />
            </div>

            <div>
              <h4 className="font-serif text-xl font-bold text-stone-900">
                {products.length === 0 ? '¡Colección en Preparación!' : 'No encontramos prendas con ese filtro'}
              </h4>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
                {products.length === 0
                  ? 'Actualmente la tienda se encuentra limpia y lista para que la dueña cargue las prendas y colecciones en dólares (USD).'
                  : 'Intenta seleccionando otra categoría o limpiando la barra de búsqueda.'}
              </p>
            </div>

            {products.length === 0 && (
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={onSwitchToOwner}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  👑 Ir al Portal de la Dueña a Cargar Ropa
                </button>
                {onLoadSampleProducts && (
                  <button
                    onClick={onLoadSampleProducts}
                    className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 transition active:scale-95 cursor-pointer"
                  >
                    ✨ Cargar 4 Prendas de Ejemplo en USD
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {availableProducts.map((product) => {
            const hasStock = product.totalStock > 0;
            const availableSizes = product.variants.filter((v) => v.stock > 0);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-stone-100 to-stone-200 text-stone-400">
                      <ShoppingBag className="w-12 h-12 text-stone-300 mb-1" />
                      <span className="text-[10px] uppercase font-bold text-stone-400">Esme Closet</span>
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <span className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {product.category}
                  </span>

                  {/* Stock Tag */}
                  {product.totalStock <= 3 && (
                    <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      ¡Últimas {product.totalStock}!
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-emerald-800 transition">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
                      {product.description || 'Prenda exclusiva confeccionada en alta calidad.'}
                    </p>
                  </div>

                  {/* Sizes pill selector preview */}
                  <div className="pt-1">
                    <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Tallas disponibles:</p>
                    <div className="flex flex-wrap gap-1">
                      {availableSizes.map((variant) => (
                        <span
                          key={variant.size}
                          className="px-1.5 py-0.5 bg-stone-100 text-stone-800 rounded font-mono text-[10px] font-bold border border-stone-200"
                        >
                          {variant.size}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-stone-400 font-semibold block leading-none">Precio:</span>
                      <span className="text-base sm:text-lg font-bold font-mono text-emerald-950">
                        {formatUSD(product.sellingPrice)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProductForCart(product);
                        const firstStockSize = product.variants.find((v) => v.stock > 0)?.size || 'S';
                        setChosenSize(firstStockSize);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-emerald-800 text-white text-xs font-bold transition active:scale-95 flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Comprar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Cart Button for Mobile when cart has items */}
      {cartItemsCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-stone-900 text-white font-bold text-sm shadow-xl flex items-center justify-between active:scale-98 transition border border-amber-400/40 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black text-xs">
                {cartItemsCount}
              </span>
              <span>Ver Bolsa de Compras</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-amber-300">
              <span>{formatUSD(cartTotal)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Quick Size Picker Modal */}
      {selectedProductForCart && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-start justify-between pb-2 border-b border-stone-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Selecciona tu talla</span>
                <h4 className="font-serif font-bold text-base text-stone-900">{selectedProductForCart.name}</h4>
                <p className="text-sm font-bold font-mono text-emerald-900">{formatUSD(selectedProductForCart.sellingPrice)}</p>
              </div>
              <button
                onClick={() => setSelectedProductForCart(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-2">Talla deseada:</label>
              <div className="grid grid-cols-3 gap-2">
                {selectedProductForCart.variants.map((v) => {
                  const isAvailable = v.stock > 0;
                  const isChosen = chosenSize === v.size;

                  return (
                    <button
                      key={v.size}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setChosenSize(v.size)}
                      className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer ${
                        !isAvailable
                          ? 'opacity-30 border-stone-200 bg-stone-100 cursor-not-allowed text-stone-400'
                          : isChosen
                            ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-extrabold ring-2 ring-emerald-700/30'
                            : 'border-stone-300 hover:border-stone-400 text-stone-700 font-medium'
                      }`}
                    >
                      <span className="block text-sm">{v.size}</span>
                      <span className="text-[9px] text-stone-500 font-normal">
                        {isAvailable ? `${v.stock} disp.` : 'Agotada'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => handleAddToCart(selectedProductForCart, chosenSize)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>Añadir a mi Bolsa • {formatUSD(selectedProductForCart.sellingPrice)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Shopping Cart & Mobile Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden animate-slide-left">
            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-stone-950 via-emerald-950 to-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-amber-500/30 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base text-stone-100">
                  Bolsa de Compras ({cartItemsCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <ShoppingBag className="w-16 h-16 text-stone-300" />
                <p className="font-serif font-bold text-stone-800 text-lg">Tu bolsa está vacía</p>
                <p className="text-xs text-stone-500 max-w-xs">
                  Explora las prendas exclusivas de Esme Closet y agrega tus vestidos y conjuntos favoritos.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs cursor-pointer hover:bg-stone-800"
                >
                  Continuar Viendo Colección
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Items in Cart */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Prendas Seleccionadas
                  </h4>

                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={`${item.product.id}-${item.size}`}
                        className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-stone-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Talla: <span className="font-bold text-stone-800">{item.size}</span>
                          </p>
                          <p className="text-xs font-mono font-bold text-emerald-950 mt-0.5">
                            {formatUSD(item.product.sellingPrice)} c/u
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(item.product.id, item.size, -1)}
                            className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(item.product.id, item.size, 1)}
                            className="w-7 h-7 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.product.id, item.size)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 transition ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Type Selector */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Método de Entrega
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('envio')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        deliveryType === 'envio'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-emerald-700" />
                      <span>Envío a Domicilio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('recogida')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        deliveryType === 'recogida'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      <span>Recoger en Boutique</span>
                    </button>
                  </div>
                </div>

                {/* Customer Contact Details */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    Tus Datos de Contacto
                  </h4>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Valeria Mendoza"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      Teléfono / WhatsApp * (para coordinar entrega)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. +1 (305) 555-0192"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-700"
                    />
                  </div>

                  {deliveryType === 'envio' && (
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Dirección Completa de Envío *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Calle, número, ciudad, código postal"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-700"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      Instrucciones o notas adicionales (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Ajuste de bastilla, empaque de regalo, etc."
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Forma de Pago en Dólares (USD)
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('zelle')}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                        paymentMethod === 'zelle'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      <span>Zelle / Transf.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('efectivo')}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                        paymentMethod === 'efectivo'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-700" />
                      <span>Contra-entrega</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('tarjeta')}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                        paymentMethod === 'tarjeta'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>Tarjeta</span>
                    </button>
                  </div>
                </div>

                {/* Price Breakdown in USD */}
                <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl space-y-2 border border-stone-800">
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Subtotal Prendas:</span>
                    <span className="font-mono">{formatUSD(cartTotal / (1 + profile.taxRate))}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Tax / Impuestos ({Math.round(profile.taxRate * 100)}%):</span>
                    <span className="font-mono">{formatUSD(cartTotal - (cartTotal / (1 + profile.taxRate)))}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-amber-300 pt-2 border-t border-stone-800">
                    <span>Total a Pagar:</span>
                    <span className="font-mono">{formatUSD(cartTotal)}</span>
                  </div>
                </div>

                {/* Confirm Order Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 text-amber-300" />
                    <span>Confirmar Pedido ({formatUSD(cartTotal)})</span>
                  </button>
                  <p className="text-[10px] text-center text-stone-500 mt-2">
                    Tu pedido se envía directamente al taller de Esmeralda Zepeda y emite tu comprobante en USD.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Order Completed Celebration Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-400/50 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-700" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                ¡Pedido Realizado con Éxito!
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900 mt-2">
                Gracias por tu compra, {completedOrder.customer.name}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Tu pedido ha sido registrado en el sistema de la boutique y notificado al instante a Esmeralda.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Número de Pedido:</span>
                <span className="font-mono font-bold text-stone-900">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Monto Total en Dólares:</span>
                <span className="font-mono font-bold text-emerald-950 text-sm">{formatUSD(completedOrder.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Estado Inicial:</span>
                <span className="font-bold text-amber-700">En Preparación</span>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleSendWhatsAppOrder(completedOrder)}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                <span>Enviar Confirmación por WhatsApp a Esmeralda</span>
              </button>

              <button
                onClick={() => setCompletedOrder(null)}
                className="w-full py-2.5 px-4 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-semibold cursor-pointer"
              >
                Volver a la Tienda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Order Tracking Modal */}
      {isTrackingOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                  Rastrear mi Pedido en Esme Closet
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsTrackingOpen(false);
                  setTrackedOrders(null);
                  setTrackingQuery('');
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchTracking} className="flex gap-2">
              <input
                type="text"
                placeholder="Ingresa tu número de pedido (ej. PED-1001) o tu teléfono..."
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-700"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer"
              >
                Buscar
              </button>
            </form>

            {/* Results display */}
            {trackedOrders !== null && (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pt-2">
                {trackedOrders.length === 0 ? (
                  <div className="p-4 bg-stone-50 rounded-2xl text-center text-xs text-stone-500">
                    No encontramos ningún pedido registrado con ese número o teléfono.
                  </div>
                ) : (
                  trackedOrders.map((ord) => {
                    const statusInfo = getOrderStatusDisplay(ord.status);
                    const matchingInvoice = invoices.find((inv) => inv.orderId === ord.id);

                    return (
                      <div key={ord.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-stone-900 text-sm">{ord.orderNumber}</span>
                            <p className="text-[10px] text-stone-500">{new Date(ord.createdAt).toLocaleDateString()} • {ord.customer.name}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Progress Stepper */}
                        <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1">
                          {['Recibido', 'Preparando', 'Listo', 'Entregado'].map((stepName, sIdx) => {
                            const isPastOrCurrent = statusInfo.step >= sIdx + 1;
                            return (
                              <div key={stepName} className="space-y-1">
                                <div className={`h-1.5 rounded-full ${isPastOrCurrent ? 'bg-emerald-600' : 'bg-stone-200'}`}></div>
                                <span className={isPastOrCurrent ? 'font-bold text-emerald-900' : 'text-stone-400'}>
                                  {stepName}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Items summary */}
                        <div className="border-t border-stone-200 pt-2 space-y-1 text-xs">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-stone-700">
                              <span>{it.quantity}x {it.productName} ({it.size})</span>
                              <span className="font-mono font-medium">{formatUSD(it.totalPrice)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-200">
                            <span>Total del Pedido:</span>
                            <span className="font-mono text-emerald-950">{formatUSD(ord.total)}</span>
                          </div>
                        </div>

                        {/* View Receipt button if available */}
                        {matchingInvoice && (
                          <button
                            onClick={() => {
                              onViewInvoice(matchingInvoice);
                              setIsTrackingOpen(false);
                            }}
                            className="w-full py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-700" />
                            <span>Ver Recibo / Factura Electrónica en USD</span>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-8 px-4 border-t border-stone-800 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img
              src={profile.logoUrl}
              alt="Logo Esme Closet"
              className="w-10 h-10 rounded-full border border-amber-400 object-cover"
            />
            <div>
              <p className="text-white font-serif font-bold text-sm">{profile.name}</p>
              <p className="text-[11px] text-stone-400">{profile.tagline}</p>
            </div>
          </div>

          <div className="text-[11px] space-y-1">
            <p>Precios expresados en <strong>Dólares Estadounidenses (USD)</strong></p>
            <p>{profile.address} • WhatsApp: {profile.whatsapp}</p>
          </div>

          <div>
            <button
              onClick={onSwitchToOwner}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              👑 Acceso Administrativo (Dueña)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
