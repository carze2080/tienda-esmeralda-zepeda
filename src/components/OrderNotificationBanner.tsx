import React from 'react';
import { Order } from '../types';
import { BellRing, X, ArrowRight, Sparkles } from 'lucide-react';

interface OrderNotificationBannerProps {
  order: Order | null;
  onClose: () => void;
  onViewOrder: (order: Order) => void;
}

export const OrderNotificationBanner: React.FC<OrderNotificationBannerProps> = ({
  order,
  onClose,
  onViewOrder,
}) => {
  if (!order) return null;

  return (
    <div className="fixed top-16 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-50 animate-bounce-in shadow-2xl">
      <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 border-2 border-amber-400/90 rounded-2xl p-3.5 text-white shadow-2xl backdrop-blur-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
              <BellRing className="w-5 h-5 text-stone-950" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ¡Nuevo Pedido!
                </span>
                <span className="text-xs text-amber-300 font-mono font-bold">
                  {order.orderNumber}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-0.5">
                {order.customer.name}
              </h4>

              <p className="text-xs text-stone-300 line-clamp-1 mt-0.5">
                {order.items.map((it) => `${it.quantity}x ${it.productName} (${it.size})`).join(', ')}
              </p>

              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm font-extrabold text-amber-300 font-mono">
                  ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Ganancia: +${order.profit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-emerald-800/40">
          <button
            onClick={() => {
              onViewOrder(order);
              onClose();
            }}
            className="flex-1 py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <span>Procesar Pedido Ahora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition cursor-pointer"
          >
            Ignorar
          </button>
        </div>
      </div>
    </div>
  );
};
