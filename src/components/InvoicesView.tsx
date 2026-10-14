import React, { useState } from 'react';
import { ElectronicInvoice } from '../types';
import { 
  Receipt, Search, ShieldCheck, Printer, Share2, 
  FileCode, ExternalLink, QrCode, CheckCircle2 
} from 'lucide-react';

interface InvoicesViewProps {
  invoices: ElectronicInvoice[];
  onViewInvoice: (invoice: ElectronicInvoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  onViewInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);

  const filteredInvoices = invoices.filter((inv) => {
    return (
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.receiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.receiver.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.uuid.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-5xl mx-auto space-y-4">
      {/* Top Fiscal Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-stone-900 text-stone-100 p-3.5 rounded-2xl border border-stone-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400">Total Facturado</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-amber-300 mt-1">
            ${totalInvoiced.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-stone-400 font-medium">
            {invoices.length} facturas electrónicas emitidas
          </span>
        </div>

        <div className="bg-stone-900 text-stone-100 p-3.5 rounded-2xl border border-stone-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400">IVA Trasladado (16%)</span>
            <Receipt className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-stone-200 mt-1">
            ${totalTax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-stone-400 font-medium">
            Declaración fiscal estimada
          </span>
        </div>

        <div className="bg-emerald-950 text-white p-3.5 rounded-2xl border border-emerald-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-300">Emisor Certificado</span>
            <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.5 rounded font-mono">CFDI 4.0</span>
          </div>
          <p className="text-sm font-bold text-white mt-1">
            Esmeralda Zepeda Boutique
          </p>
          <p className="text-[10px] text-emerald-200/90 font-mono mt-0.5">
            RFC: ZEPE910412-EZ8 • Timbrado 100% Automático
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Buscar factura por cliente, RFC, folio (EZ-...) o UUID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-stone-300 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-sm"
        />
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredInvoices.map((inv) => (
          <div
            key={inv.id}
            onClick={() => onViewInvoice(inv)}
            className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-3.5 sm:p-4 hover:border-emerald-600 cursor-pointer transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                <Receipt className="w-5 h-5 text-emerald-700" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-stone-900">
                    {inv.invoiceNumber}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Vigente
                  </span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 mt-0.5 truncate">
                  {inv.receiver.name}
                </h4>

                <p className="text-[11px] text-stone-500 font-mono">
                  RFC: <span className="font-bold text-stone-700">{inv.receiver.rfc}</span> • {inv.issueDate}
                </p>

                <p className="text-[10px] text-stone-400 font-mono truncate max-w-xs mt-0.5">
                  UUID: {inv.uuid}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
              <div className="text-left sm:text-right">
                <span className="font-mono font-black text-base text-stone-900">
                  ${inv.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] text-stone-500">
                  Subtotal: ${inv.subtotal.toFixed(2)} + IVA: ${inv.taxAmount.toFixed(2)}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewInvoice(inv);
                }}
                className="mt-2 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-emerald-700 text-stone-100 hover:text-white font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <span>Ver CFDI Oficial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-stone-300">
            <Receipt className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <h4 className="font-bold text-stone-700 text-sm">No hay facturas registradas</h4>
            <p className="text-xs text-stone-500 mt-1">
              Cada venta realizada en el punto de venta o en la tienda emitirá una factura electrónica automáticamente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
