import React, { useState } from 'react';
import { Product, ClothingSize, OrderItem, CustomerInfo, BoutiqueProfile } from '../types';
import { 
  X, ShoppingBag, Plus, Minus, Check, ArrowRight, 
  Sparkles, Heart, ShieldCheck, MapPin, Phone, User, Store 
} from 'lucide-react';

interface ClientShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  profile: BoutiqueProfile;
  onSubmitClientOrder: (customer: CustomerInfo, items: OrderItem[], notes?: string) => void;
}

export const ClientShopModal: React.FC<ClientShopModalProps> = ({
  isOpen,
  onClose,
  products,
  profile,
  onSubmitClientOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [cart, setCart] = useState<{ product: Product; size: ClothingSize; quantity: number }[]>([]);
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);

  // Client form
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [completedOrderNum, setCompletedOrderNum] = useState('');

  if (!isOpen) return null;

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'todos') return p.totalStock > 0;
    return p.category === selectedCategory && p.totalStock > 0;
  });

  const handleAddToCart = (product: Product, size: ClothingSize) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id && item.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [...prev, { product, size, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, size: ClothingSize, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId && item.size === size) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; size: ClothingSize; quantity: number }[];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !clientName.trim() || !clientPhone.trim()) return;

    const orderItems: OrderItem[] = cart.map((c) => {
      const variant = c.product.variants.find((v) => v.size === c.size);
      return {
        productId: c.product.id,
        productName: c.product.name,
        size: c.size,
        color: variant?.color || 'Verde Esmeralda',
        quantity: c.quantity,
        unitCost: c.product.totalCost,
        unitPrice: c.product.sellingPrice,
        totalCost: c.product.totalCost * c.quantity,
        totalPrice: c.product.sellingPrice * c.quantity,
        sku: variant?.sku || `${c.product.sku}-${c.size}`,
      };
    });

    const customer: CustomerInfo = {
      name: clientName.trim(),
      phone: clientPhone.trim(),
      address: clientAddress.trim() || undefined,
      rfc: 'XAXX010101000',
      cfdiUsage: 'S01 - Sin efectos fiscales',
    };

    onSubmitClientOrder(customer, orderItems, clientNotes);

    const generatedNum = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    setCompletedOrderNum(generatedNum);
    setOrderCompleted(true);
    setCart([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-stone-50 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-amber-400/40 overflow-hidden">
        {/* Boutique Top Brand Banner */}
        <div className="bg-gradient-to-r from-stone-950 via-emerald-950 to-stone-900 text-stone-100 p-4 sm:px-6 flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={profile.logoUrl}
              alt="Logo Esmeralda Zepeda"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shadow-md bg-stone-900"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  Catálogo Digital Exclusivo
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white leading-tight">
                {profile.name}
              </h3>
              <p className="text-[11px] text-stone-300">
                Por <span className="text-amber-300 font-semibold">{profile.ownerName}</span> • Pedidos directos a su teléfono
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {orderCompleted ? (
            /* Order success screen */
            <div className="bg-white rounded-2xl p-6 text-center border border-stone-200 shadow-sm space-y-4 my-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
                  ¡Pedido Enviado con Éxito!
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                  Gracias por tu compra, {clientName}
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
                  Esmeralda Zepeda acaba de recibir tu pedido instantáneamente en su teléfono. Comenzará a prepararlo de inmediato y emitirá tu factura electrónica automática.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 max-w-sm mx-auto text-xs space-y-1">
                <p><span className="text-stone-500">Número de Pedido:</span> <span className="font-mono font-bold text-stone-900">{completedOrderNum}</span></p>
                <p><span className="text-stone-500">Teléfono registrado:</span> <span className="font-medium text-stone-800">{clientPhone}</span></p>
                <p className="text-[11px] text-emerald-800 font-medium pt-1">
                  Recibirás confirmación por WhatsApp en unos momentos.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setOrderCompleted(false);
                    setIsCheckoutStep(false);
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  Volver al Panel Principal
                </button>
              </div>
            </div>
          ) : !isCheckoutStep ? (
            /* Garment catalog browsing */
            <>
              {/* Boutique Hero banner */}
              <div className="relative rounded-2xl overflow-hidden shadow-sm h-36 sm:h-44 border border-stone-200">
                <img
                  src={profile.heroBannerUrl}
                  alt="Boutique Esmeralda Zepeda"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                    Colección Alta Costura
                  </span>
                  <h4 className="font-serif text-lg sm:text-xl font-bold">
                    Elegancia Atemporal Diseñada para Ti
                  </h4>
                  <p className="text-[11px] text-stone-200">
                    Factura electrónica inmediata y empaque de regalo en cada pedido.
                  </p>
                </div>
              </div>

              {/* Garment Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-stone-200 p-3 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-40 object-cover rounded-xl bg-stone-100"
                        />
                        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-900/80 text-white backdrop-blur-sm">
                          {p.category}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-stone-900 mt-2 line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                        {p.description}
                      </p>

                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-sm font-black font-mono text-emerald-950">
                          ${p.sellingPrice.toLocaleString('es-MX', { minimumFractionDigits: 0 })} {profile.currency}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          IVA 16% Incluido
                        </span>
                      </div>
                    </div>

                    {/* Size Selector directly in the card */}
                    <div className="mt-3 pt-2.5 border-t border-stone-100">
                      <span className="text-[10px] font-bold text-stone-600 block mb-1">
                        Selecciona tu talla:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {p.variants
                          .filter((v) => v.stock > 0)
                          .map((v) => (
                            <button
                              key={v.sku}
                              onClick={() => handleAddToCart(p, v.size)}
                              className="px-2.5 py-1 rounded-lg border border-stone-300 hover:border-emerald-700 hover:bg-emerald-50 text-[11px] font-bold text-stone-800 transition active:scale-95 cursor-pointer flex items-center gap-1"
                            >
                              <span>{v.size}</span>
                              <Plus className="w-3 h-3 text-emerald-700" />
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Checkout step: customer info */
            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  Tus Datos para la Entrega y Factura
                </h4>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Tu Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. Ana Paulina Gómez"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Teléfono / WhatsApp * (recibirás aquí la confirmación y factura)
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+52 33..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Dirección de Entrega o "Recoger en Boutique"
                  </label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Calle, número, colonia o 'Paso a recoger a boutique'"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Instrucciones Especiales o Talla Personalizada
                  </label>
                  <input
                    type="text"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Ej. Favor de empacar para regalo de cumpleaños"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Order items recap */}
              <div className="bg-stone-100 rounded-2xl p-4 border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Resumen de tu Pedido
                </h4>
                {cart.map((it) => (
                  <div key={`${it.product.id}-${it.size}`} className="flex justify-between items-center text-xs">
                    <span>{it.quantity}x {it.product.name} (Talla {it.size})</span>
                    <span className="font-mono font-bold">${(it.product.sellingPrice * it.quantity).toLocaleString('es-MX')}</span>
                  </div>
                ))}

                <div className="pt-2 border-t border-stone-300 flex justify-between items-center font-bold text-sm text-stone-900">
                  <span>Total a Pagar:</span>
                  <span className="font-mono text-emerald-950 font-black">${cartTotal.toLocaleString('es-MX')} {profile.currency}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutStep(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-medium"
                >
                  Modificar Prendas
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Enviar Pedido al Teléfono de Esmeralda</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer with Cart Pill (when browsing) */}
        {!orderCompleted && !isCheckoutStep && (
          <div className="bg-stone-900 text-white p-3.5 sm:px-6 border-t border-stone-800 flex items-center justify-between gap-3 shrink-0">
            <div>
              <p className="text-xs text-stone-300">
                {totalItemsCount} {totalItemsCount === 1 ? 'prenda' : 'prendas'} seleccionadas
              </p>
              <p className="text-base font-black font-mono text-amber-300">
                ${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 0 })} {profile.currency}
              </p>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutStep(true)}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
            >
              <span>Continuar al Pedido</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
