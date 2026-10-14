import React, { useState } from 'react';
import { Product, ClothingSize, OrderItem, CustomerInfo, PaymentMethod, BoutiqueProfile } from '../types';
import { 
  ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle2, 
  CreditCard, Banknote, ArrowRight, User, Phone, FileText,
  DollarSign, Sparkles, X, ChevronRight, ShieldCheck, Mail
} from 'lucide-react';
import { formatUSD } from '../utils/currency';

interface CartItem extends OrderItem {
  maxStock: number;
}

interface POSViewProps {
  products: Product[];
  profile: BoutiqueProfile;
  onCreateOrder: (
    customer: CustomerInfo,
    items: OrderItem[],
    paymentMethod: PaymentMethod,
    notes?: string
  ) => void;
}

export const POSView: React.FC<POSViewProps> = ({
  products,
  profile,
  onCreateOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Quick size selector dialog state
  const [sizePickerProduct, setSizePickerProduct] = useState<Product | null>(null);

  // Customer & payment details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [requiresCustomRFC, setRequiresCustomRFC] = useState(false);
  const [customerRFC, setCustomerRFC] = useState('');
  const [customerFiscalName, setCustomerFiscalName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenSizePicker = (prod: Product) => {
    // If only one variant with stock, add directly
    const availableVariants = prod.variants.filter((v) => v.stock > 0);
    if (availableVariants.length === 1) {
      handleAddToCart(prod, availableVariants[0].size);
    } else {
      setSizePickerProduct(prod);
    }
  };

  const handleAddToCart = (product: Product, size: ClothingSize) => {
    const variant = product.variants.find((v) => v.size === size);
    if (!variant || variant.stock <= 0) return;

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (it) => it.productId === product.id && it.size === size
      );

      if (existingIdx >= 0) {
        const item = prevCart[existingIdx];
        if (item.quantity >= variant.stock) return prevCart; // don't exceed stock
        const newCart = [...prevCart];
        const newQty = item.quantity + 1;
        newCart[existingIdx] = {
          ...item,
          quantity: newQty,
          totalPrice: newQty * item.unitPrice,
          totalCost: newQty * item.unitCost,
        };
        return newCart;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          productName: product.name,
          size,
          color: variant.color,
          quantity: 1,
          unitCost: product.totalCost,
          unitPrice: product.sellingPrice,
          totalCost: product.totalCost,
          totalPrice: product.sellingPrice,
          sku: variant.sku,
          maxStock: variant.stock,
        };
        return [...prevCart, newItem];
      }
    });

    setSizePickerProduct(null);
  };

  const handleUpdateQuantity = (productId: string, size: ClothingSize, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((it) => {
          if (it.productId === productId && it.size === size) {
            const nextQty = it.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > it.maxStock) return it;
            return {
              ...it,
              quantity: nextQty,
              totalPrice: nextQty * it.unitPrice,
              totalCost: nextQty * it.unitCost,
            };
          }
          return it;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string, size: ClothingSize) => {
    setCart((prev) => prev.filter((it) => !(it.productId === productId && it.size === size)));
  };

  // Cart calculations
  const totalItemsCount = cart.reduce((acc, it) => acc + it.quantity, 0);
  const cartTotal = cart.reduce((acc, it) => acc + it.totalPrice, 0);
  const cartCostTotal = cart.reduce((acc, it) => acc + it.totalCost, 0);
  const cartNetProfit = cartTotal - cartCostTotal;

  const cashGiven = parseFloat(cashTendered) || 0;
  const cashChange = cashGiven >= cartTotal ? cashGiven - cartTotal : 0;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const customer: CustomerInfo = {
      name: customerName.trim() || 'Cliente Mostrador',
      phone: customerPhone.trim() || profile.whatsapp,
      email: customerEmail.trim() || undefined,
      rfc: requiresCustomRFC && customerRFC.trim() ? customerRFC.trim().toUpperCase() : 'XAXX010101000',
      fiscalName: requiresCustomRFC && customerFiscalName.trim() ? customerFiscalName.trim().toUpperCase() : (customerName.trim() || 'PUBLICO EN GENERAL'),
      cfdiUsage: requiresCustomRFC ? 'G03 - Gastos en general' : 'S01 - Sin efectos fiscales',
    };

    onCreateOrder(customer, cart, paymentMethod, orderNotes);

    // Reset form & cart
    setCart([]);
    setIsCartOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerRFC('');
    setCustomerFiscalName('');
    setRequiresCustomRFC(false);
    setCashTendered('');
    setOrderNotes('');
  };

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-5xl mx-auto space-y-4">
      {/* Search & Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar prenda para registrar venta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-stone-300 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-sm"
          />
        </div>

        {/* Floating Cart Trigger Pill on top for mobile */}
        {cart.length > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-between gap-2 shadow-md transition active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Carrito ({totalItemsCount})</span>
            </div>
            <span className="font-mono bg-stone-950 text-amber-300 px-2 py-0.5 rounded-lg text-xs font-bold">
              ${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </span>
          </button>
        )}
      </div>

      {/* Grid of Garments for fast mobile tapping */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredProducts.map((product) => {
          const isOutOfStock = product.totalStock <= 0;

          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col justify-between transition ${
                isOutOfStock ? 'opacity-55' : 'hover:border-emerald-600/50'
              }`}
            >
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-36 sm:h-44 object-cover bg-stone-100"
                />
                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-900/80 text-stone-100 backdrop-blur-sm">
                  {product.category}
                </span>

                {isOutOfStock ? (
                  <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-md">
                    Agotado
                  </span>
                ) : (
                  <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-stone-900/80 text-amber-300 font-mono px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Stock: {product.totalStock}
                  </span>
                )}
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-sm font-extrabold font-mono text-emerald-950">
                      {formatUSD(product.sellingPrice)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      (+{formatUSD(product.profitAmount)} ganancia)
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-100">
                  <button
                    disabled={isOutOfStock}
                    onClick={() => handleOpenSizePicker(product)}
                    className="w-full py-2 px-2.5 rounded-xl bg-stone-900 hover:bg-emerald-700 text-stone-100 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-40 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Agregar al Pedido</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-stone-200 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <h4 className="font-serif text-lg font-bold text-stone-800">Catálogo limpio y listo para tus prendas</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Aún no tienes prendas registradas. Dirígete a la pestaña <strong>"Inventario"</strong> para registrar tu primera prenda con sus costos y comenzar a registrar ventas.
            </p>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar when Cart has items */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-16 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-emerald-900 to-stone-900 border-2 border-amber-400 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 cursor-pointer transition active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5 text-stone-950" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-stone-100">
                  {totalItemsCount} {totalItemsCount === 1 ? 'prenda' : 'prendas'} en pedido
                </p>
                <p className="text-[11px] text-emerald-300">
                  Ganancia: +{formatUSD(cartNetProfit)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-black font-mono text-amber-300">
                {formatUSD(cartTotal)}
              </span>
              <ChevronRight className="w-5 h-5 text-amber-400" />
            </div>
          </button>
        </div>
      )}

      {/* Size Picker Dialog */}
      {sizePickerProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h4 className="text-xs font-bold text-stone-900 truncate">
                Selecciona Talla: {sizePickerProduct.name}
              </h4>
              <button
                onClick={() => setSizePickerProduct(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2">
              {sizePickerProduct.variants.map((v) => (
                <button
                  key={v.sku}
                  disabled={v.stock <= 0}
                  onClick={() => handleAddToCart(sizePickerProduct, v.size)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer ${
                    v.stock > 0
                      ? 'border-stone-300 hover:border-emerald-600 hover:bg-emerald-50 bg-stone-50'
                      : 'border-stone-200 bg-stone-100 text-stone-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{v.size}</span>
                    <span className="text-stone-500 text-[11px]">({v.color})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono ${v.stock <= 2 ? 'text-amber-700 font-bold' : 'text-stone-600'}`}>
                      {v.stock > 0 ? `${v.stock} disp.` : 'Agotada'}
                    </span>
                    {v.stock > 0 && <Plus className="w-3.5 h-3.5 text-emerald-700" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Mobile Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden animate-slide-left">
            {/* Drawer Header */}
            <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  Registrar Pedido & Facturar
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Garment list in cart */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Prendas en el Pedido ({totalItemsCount})
                </h4>

                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {item.productName}
                        </p>
                        <p className="text-[10px] text-stone-500">
                          Talla: <span className="font-bold text-stone-700">{item.size}</span> • {item.color}
                        </p>
                        <p className="text-xs font-mono font-bold text-emerald-900 mt-0.5">
                          {formatUSD(item.unitPrice)} c/u
                        </p>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.productId, item.size, -1)}
                          className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold font-mono text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.productId, item.size, 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="w-7 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-30 text-white flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.productId, item.size)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  Datos del Cliente
                </h4>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Sofia Villarreal"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Teléfono / WhatsApp * (para notificar factura)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+52 33..."
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Correo Electrónico (opcional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Fiscal Invoicing Toggle */}
                <div className="pt-2 border-t border-stone-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-800">
                    <input
                      type="checkbox"
                      checked={requiresCustomRFC}
                      onChange={(e) => setRequiresCustomRFC(e.target.checked)}
                      className="accent-emerald-700 w-4 h-4 rounded"
                    />
                    <span>¿Requiere RFC personalizado para deducción?</span>
                  </label>

                  {requiresCustomRFC && (
                    <div className="mt-2.5 space-y-2 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200">
                      <div>
                        <label className="text-[10px] font-bold text-emerald-950 block">RFC del Cliente</label>
                        <input
                          type="text"
                          value={customerRFC}
                          onChange={(e) => setCustomerRFC(e.target.value.toUpperCase())}
                          placeholder="XAXX010101000"
                          className="w-full px-2.5 py-1 bg-white border border-emerald-300 rounded text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-emerald-950 block">Razón Social Fiscal</label>
                        <input
                          type="text"
                          value={customerFiscalName}
                          onChange={(e) => setCustomerFiscalName(e.target.value)}
                          placeholder="Nombre fiscal de la empresa o persona"
                          className="w-full px-2.5 py-1 bg-white border border-emerald-300 rounded text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {!requiresCustomRFC && (
                    <p className="text-[10px] text-stone-500 mt-1">
                      Se emitirá con RFC genérico <span className="font-mono font-bold">XAXX010101000</span> (Público General).
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Forma de Pago
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      paymentMethod === 'efectivo'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transferencia')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      paymentMethod === 'transferencia'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span>Transferencia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tarjeta')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      paymentMethod === 'tarjeta'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>Tarjeta</span>
                  </button>
                </div>

                {/* Cash Change Calculator */}
                {paymentMethod === 'efectivo' && (
                  <div className="bg-stone-100 p-2.5 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-700">Monto recibido del cliente:</span>
                      <div className="w-28 relative">
                        <span className="absolute left-2 top-1.5 text-stone-400 font-bold">$</span>
                        <input
                          type="number"
                          value={cashTendered}
                          onChange={(e) => setCashTendered(e.target.value)}
                          placeholder="0"
                          className="w-full pl-5 pr-2 py-1 bg-white border border-stone-300 rounded font-mono font-bold text-xs text-right"
                        />
                      </div>
                    </div>
                    {cashGiven >= cartTotal && (
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900 pt-1 border-t border-stone-200">
                        <span>Cambio a devolver:</span>
                        <span className="font-mono text-sm text-emerald-700">
                          ${cashChange.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div>
                <label className="text-[11px] font-bold text-stone-600 block mb-1">
                  Notas del Pedido (opcional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej. Envolver para regalo con moño oro..."
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
              </div>

              {/* Financial Calculation breakdown */}
              <div className="bg-stone-900 text-stone-100 p-3.5 rounded-2xl space-y-2 border border-stone-800">
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Costo Total de las Prendas:</span>
                  <span className="font-mono">${cartCostTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-400 font-bold">
                  <span>Tu Ganancia Neta:</span>
                  <span className="font-mono">+${cartNetProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-base font-black text-amber-300 pt-2 border-t border-stone-800">
                  <span>Total a Cobrar:</span>
                  <span className="font-mono">${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <span>Cobrar y Emitir Factura Electrónica</span>
                </button>
                <p className="text-[10px] text-center text-stone-500 mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Genera CFDI con timbrado automático y descuenta inventario.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
