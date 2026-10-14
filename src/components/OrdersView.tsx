import React, { useState } from 'react';
import { Order, OrderStatus, ElectronicInvoice, BoutiqueProfile } from '../types';
import { 
  Bell, CheckCircle2, Clock, PackageCheck, Send, 
  Receipt, MessageCircle, AlertCircle, Sparkles, Filter, 
  ExternalLink, ChevronRight
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  invoices: ElectronicInvoice[];
  profile: BoutiqueProfile;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onViewInvoice: (invoice: ElectronicInvoice) => void;
  onSimulateOrder: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  invoices,
  profile,
  onUpdateOrderStatus,
  onViewInvoice,
  onSimulateOrder,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  const newOrdersCount = orders.filter((o) => o.status === 'nuevo').length;

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === 'todos') return true;
    return o.status === selectedStatus;
  });

  const handleSendWhatsAppNotification = (order: Order) => {
    const invoice = invoices.find((inv) => inv.orderId === order.id);
    const invoiceSnippet = invoice 
      ? `\n📄 Tu Factura Electrónica está lista (Folio ${invoice.invoiceNumber}).`
      : '';

    const statusText = 
      order.status === 'nuevo' ? 'ha sido recibido y estamos preparándolo' :
      order.status === 'en_proceso' ? 'está siendo confeccionado / empacado con listón y aroma' :
      order.status === 'listo' ? 'está listo para entrega o envío inmediato' :
      'ha sido entregado con éxito';

    const message = encodeURIComponent(
      `¡Hola ${order.customer.name}! ✨\n\n` +
      `Te escribe *Esmeralda Zepeda* de la boutique. Tu pedido *${order.orderNumber}* ${statusText}.\n\n` +
      `👗 *Prendas:*\n` +
      order.items.map((it) => `• ${it.quantity}x ${it.productName} (Talla ${it.size})`).join('\n') +
      `\n\n💰 *Total:* $${order.total.toFixed(2)} ${profile.currency}` +
      invoiceSnippet +
      `\n\n¡Gracias por preferir nuestros diseños exclusivos! Quedo a tus órdenes.`
    );

    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'nuevo':
        return (
          <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            Nuevo Pedido
          </span>
        );
      case 'en_proceso':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" />
            En Preparación
          </span>
        );
      case 'listo':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
            <PackageCheck className="w-3 h-3 text-blue-700" />
            Listo p/ Entrega
          </span>
        );
      case 'entregado':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Entregado
          </span>
        );
      case 'cancelado':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-5xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-stone-100 font-serif">
              Gestión de Pedidos en Tiempo Real
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Recibe alertas inmediatas con sonido al teléfono y procesa cada pedido con 1 toque.
          </p>
        </div>

        <button
          onClick={onSimulateOrder}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-stone-950" />
          <span>Probar Notificación Instantánea</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedStatus('todos')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition cursor-pointer ${
            selectedStatus === 'todos'
              ? 'bg-stone-900 text-white font-bold'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          Todos ({orders.length})
        </button>

        <button
          onClick={() => setSelectedStatus('nuevo')}
          className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition cursor-pointer flex items-center gap-1 ${
            selectedStatus === 'nuevo'
              ? 'bg-red-700 text-white'
              : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
          }`}
        >
          <span>Nuevos</span>
          {newOrdersCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {newOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSelectedStatus('en_proceso')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition cursor-pointer ${
            selectedStatus === 'en_proceso'
              ? 'bg-amber-600 text-white font-bold'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          En Preparación
        </button>

        <button
          onClick={() => setSelectedStatus('listo')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition cursor-pointer ${
            selectedStatus === 'listo'
              ? 'bg-blue-600 text-white font-bold'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          Listos p/ Entrega
        </button>

        <button
          onClick={() => setSelectedStatus('entregado')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition cursor-pointer ${
            selectedStatus === 'entregado'
              ? 'bg-emerald-700 text-white font-bold'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          Entregados
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const invoice = invoices.find((inv) => inv.orderId === order.id);
          const orderDate = new Date(order.createdAt).toLocaleDateString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short',
          });

          return (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition ${
                order.status === 'nuevo'
                  ? 'border-red-300 ring-2 ring-red-100'
                  : 'border-stone-200/90'
              }`}
            >
              <div className="p-3.5 sm:p-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-stone-900">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                      {order.isOnlineOrder && (
                        <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-1.5 py-0.5 rounded border border-purple-200">
                          Tienda Web
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      {orderDate}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-sm sm:text-base text-stone-900">
                      ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-[10px] text-emerald-800 font-bold">
                      Ganancia: +${order.profit.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="py-2 flex flex-col sm:flex-row justify-between gap-1 text-xs">
                  <div>
                    <span className="text-stone-600 text-[11px]">Cliente: </span>
                    <span className="font-bold text-stone-900">{order.customer.name}</span>
                    {order.customer.phone && (
                      <span className="text-stone-600 ml-1.5">
                        ({order.customer.phone})
                      </span>
                    )}
                  </div>
                  <div className="text-stone-600 text-[11px]">
                    <span>Pago: </span>
                    <span className="font-semibold capitalize text-stone-800">
                      {order.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Items ordered */}
                <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/60 my-1 space-y-1">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-stone-200 text-stone-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                          {it.quantity}x
                        </span>
                        <span className="font-medium text-stone-800 truncate">
                          {it.productName}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 shrink-0">
                          [Talla {it.size}]
                        </span>
                      </div>
                      <span className="font-mono text-stone-700 font-semibold ml-2 shrink-0 text-[11px]">
                        ${it.totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}

                  {order.notes && (
                    <p className="text-[11px] text-amber-900 italic pt-1 border-t border-stone-200/60">
                      Nota: "{order.notes}"
                    </p>
                  )}
                </div>

                {/* Financial cost breakdown strip */}
                <div className="flex items-center justify-between text-[11px] text-stone-600 pt-2 px-1">
                  <span>Costo de prendas: ${order.totalCost.toFixed(2)}</span>
                  <span>IVA Incluido (16%): ${order.taxAmount.toFixed(2)}</span>
                  <span className="font-bold text-emerald-800">Utilidad Neta: ${order.profit.toFixed(2)}</span>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="bg-stone-50 px-3.5 py-2.5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                {/* Status Transition buttons */}
                <div className="flex items-center gap-1.5">
                  {order.status === 'nuevo' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'en_proceso')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Aceptar y Preparar</span>
                    </button>
                  )}

                  {order.status === 'en_proceso' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'listo')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Listo para Entrega</span>
                    </button>
                  )}

                  {order.status === 'listo' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'entregado')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marcar Entregado</span>
                    </button>
                  )}
                </div>

                {/* WhatsApp & Invoice Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSendWhatsAppNotification(order)}
                    title="Notificar al cliente por WhatsApp"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {invoice && (
                    <button
                      onClick={() => onViewInvoice(invoice)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs transition cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-300" />
                      <span>Factura CFDI</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-stone-300">
            <Bell className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <h4 className="font-bold text-stone-700 text-sm">No hay pedidos con este estado</h4>
            <p className="text-xs text-stone-500 mt-1">
              Los nuevos pedidos que hagan tus clientes o desde el punto de venta aparecerán aquí de inmediato.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
