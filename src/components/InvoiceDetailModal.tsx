import React, { useState } from 'react';
import { ElectronicInvoice } from '../types';
import { X, Printer, Share2, FileCode, CheckCircle2, QrCode, Download, ShieldCheck } from 'lucide-react';

interface InvoiceDetailModalProps {
  invoice: ElectronicInvoice | null;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola ${invoice.receiver.name}! ✨\n\nAquí tienes tu Factura Electrónica de *${invoice.issuer.tradeName}*:\n` +
      `📄 Folio: ${invoice.invoiceNumber}\n` +
      `🔑 Folio Fiscal (UUID): ${invoice.uuid}\n` +
      `💰 Total: $${invoice.total.toFixed(2)} ${invoice.currency}\n` +
      `📅 Fecha: ${invoice.issueDate}\n\n` +
      `¡Gracias por tu preferencia y vestir con elegancia!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownloadXML = () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" Version="4.0" Serie="EZ" Folio="${invoice.invoiceNumber}" Fecha="${invoice.issueDate.replace(' ', 'T')}" FormaPago="${invoice.paymentMethod.substring(0, 2)}" SubTotal="${invoice.subtotal.toFixed(2)}" Total="${invoice.total.toFixed(2)}" Moneda="${invoice.currency}" MetodoPago="${invoice.paymentType.substring(0, 3)}" LugarExpedicion="44500" Sello="${invoice.issuer.digitalStamp}">
  <cfdi:Emisor Rfc="${invoice.issuer.rfc}" Nombre="${invoice.issuer.businessName}" RegimenFiscal="${invoice.issuer.fiscalRegime.substring(0, 3)}"/>
  <cfdi:Receptor Rfc="${invoice.receiver.rfc}" Nombre="${invoice.receiver.name}" UsoCFDI="${invoice.receiver.cfdiUsage.substring(0, 3)}"/>
  <cfdi:Conceptos>
    ${invoice.items
      .map(
        (it) =>
          `<cfdi:Concepto ClaveProdServ="${it.satProductCode.substring(0, 8)}" Cantidad="${it.quantity}" ClaveUnidad="H87" Descripcion="${it.description}" ValorUnitario="${it.unitPrice.toFixed(2)}" Importe="${it.amount.toFixed(2)}"/>`
      )
      .join('\n    ')}
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${invoice.taxAmount.toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${invoice.subtotal.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${invoice.taxAmount.toFixed(2)}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="1.1" UUID="${invoice.uuid}" FechaTimbrado="${invoice.issueDate.replace(' ', 'T')}" RfcProvCertif="SAT970701NN3" SelloCFD="${invoice.issuer.digitalStamp}" NoCertificadoSAT="${invoice.issuer.certificateNumber}" SelloSAT="${invoice.satStamp}"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_${invoice.invoiceNumber}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white text-stone-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="no-print bg-stone-900 text-stone-100 p-3.5 sm:px-6 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 text-stone-100">
                Factura Electrónica Emitida
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/40">
                  CFDI 4.0 Válido
                </span>
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                {invoice.invoiceNumber} • Folio: {invoice.uuid.substring(0, 18)}...
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="no-print bg-stone-100 px-4 py-2 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadXML}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-stone-200 font-medium transition active:scale-95 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>XML</span>
            </button>
          </div>

          <div className="text-stone-500 text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Generada automáticamente</span>
          </div>
        </div>

        {/* Scrollable Printable Invoice Content */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-white" id="printable-factura">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-emerald-800/20">
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/esme_closet_logo_1792002111413.jpg"
                alt="Logo Esme Closet"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full border-2 border-amber-500/80 object-cover shadow-sm bg-white"
              />
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-emerald-950">
                  {invoice.issuer.tradeName}
                </h1>
                <p className="text-xs text-amber-700 font-semibold tracking-wider uppercase">
                  Alta Costura & Diseño Femenino
                </p>
                <p className="text-xs text-stone-600 font-medium">
                  {invoice.issuer.ownerName} • {invoice.issuer.rfc}
                </p>
                <p className="text-[11px] text-stone-500">
                  {invoice.issuer.address}
                </p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-right sm:min-w-[220px]">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 mb-1">
                Factura Electrónica (CFDI)
              </span>
              <p className="text-base font-bold font-mono text-emerald-900">
                {invoice.invoiceNumber}
              </p>
              <p className="text-[11px] text-stone-500 font-medium">
                Fecha: {invoice.issueDate}
              </p>
              <p className="text-[10px] text-stone-400 font-mono">
                Lugar de expedición: 44500
              </p>
            </div>
          </div>

          {/* Issuer and Receiver Data Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs bg-stone-50/70 p-4 rounded-xl border border-stone-200/80">
            <div>
              <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] text-emerald-900 mb-2 border-b border-stone-200 pb-1">
                Datos del Emisor
              </h4>
              <p className="font-semibold text-stone-900">{invoice.issuer.businessName}</p>
              <p><span className="text-stone-500">RFC:</span> <span className="font-mono font-bold text-stone-800">{invoice.issuer.rfc}</span></p>
              <p><span className="text-stone-500">Régimen Fiscal:</span> {invoice.issuer.fiscalRegime}</p>
              <p><span className="text-stone-500">No. Certificado CSD:</span> <span className="font-mono">{invoice.issuer.certificateNumber}</span></p>
            </div>

            <div>
              <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] text-emerald-900 mb-2 border-b border-stone-200 pb-1">
                Datos del Receptor (Cliente)
              </h4>
              <p className="font-bold text-stone-900">{invoice.receiver.name}</p>
              <p><span className="text-stone-500">RFC:</span> <span className="font-mono font-bold text-stone-800">{invoice.receiver.rfc}</span></p>
              <p><span className="text-stone-500">Uso de CFDI:</span> {invoice.receiver.cfdiUsage}</p>
              {invoice.receiver.address && (
                <p><span className="text-stone-500">Domicilio:</span> {invoice.receiver.address}</p>
              )}
              {invoice.receiver.email && (
                <p><span className="text-stone-500">Email:</span> {invoice.receiver.email}</p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-lg border border-stone-200 mb-6">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-900 text-stone-100 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-2.5">Cant.</th>
                  <th className="p-2.5">Clave SAT</th>
                  <th className="p-2.5">Descripción de Prenda</th>
                  <th className="p-2.5 text-right">Precio Unitario</th>
                  <th className="p-2.5 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-2.5 font-bold font-mono">{item.quantity}</td>
                    <td className="p-2.5 font-mono text-[10px] text-stone-500">53101500 / H87</td>
                    <td className="p-2.5">
                      <p className="font-medium text-stone-900">{item.description}</p>
                      <p className="text-[10px] text-stone-500">Talla: {item.size} • Color: {item.color}</p>
                    </td>
                    <td className="p-2.5 text-right font-mono">
                      ${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-stone-900">
                      ${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Info & Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-stone-200">
            <div className="text-xs space-y-1 sm:max-w-xs text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-200/60 w-full sm:w-auto">
              <p><span className="font-semibold text-stone-800">Método de Pago:</span> {invoice.paymentType}</p>
              <p><span className="font-semibold text-stone-800">Forma de Pago:</span> {invoice.paymentMethod}</p>
              <p><span className="font-semibold text-stone-800">Moneda:</span> {invoice.currency} (Pesos Mexicanos)</p>
              <p><span className="font-semibold text-stone-800">Tipo de Comprobante:</span> I - Ingreso</p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between py-1 text-stone-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">${invoice.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 text-stone-600">
                <span>IVA Trasladado (16%):</span>
                <span className="font-mono font-medium">${invoice.taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-stone-800 text-base font-bold text-emerald-950">
                <span>Total:</span>
                <span className="font-mono text-emerald-900">${invoice.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* CFDI Fiscal Digital Seals and QR */}
          <div className="mt-6 pt-2 flex flex-col sm:flex-row gap-4 items-start text-[10px] text-stone-500 font-mono">
            {/* Verification QR representation */}
            <div className="shrink-0 p-2 border border-stone-300 rounded-lg bg-stone-50 flex flex-col items-center">
              <div className="w-24 h-24 bg-stone-900 text-white rounded p-1 flex flex-col items-center justify-center text-center">
                <QrCode className="w-16 h-16 text-amber-400 mb-0.5" />
                <span className="text-[8px] text-stone-300 font-sans">SAT VERIFICADO</span>
              </div>
              <span className="text-[9px] mt-1 text-stone-600 font-sans">Escanear para validar</span>
            </div>

            {/* Timbre fiscal digital strings */}
            <div className="space-y-2 overflow-hidden flex-1">
              <div>
                <p className="font-bold text-stone-700 uppercase font-sans">Folio Fiscal (UUID):</p>
                <p className="break-all font-semibold text-emerald-950 bg-stone-50 p-1 rounded border border-stone-200">
                  {invoice.uuid}
                </p>
              </div>

              <div>
                <p className="font-bold text-stone-700 uppercase font-sans">Sello Digital del Emisor:</p>
                <p className="break-all text-[9px] line-clamp-2 text-stone-600">
                  {invoice.issuer.digitalStamp}
                </p>
              </div>

              <div>
                <p className="font-bold text-stone-700 uppercase font-sans">Sello Digital del SAT:</p>
                <p className="break-all text-[9px] line-clamp-2 text-stone-600">
                  {invoice.satStamp}
                </p>
              </div>

              <div>
                <p className="font-bold text-stone-700 uppercase font-sans">Cadena Original:</p>
                <p className="break-all text-[8px] line-clamp-1 text-stone-500">
                  {invoice.originalChain}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-stone-400 font-serif italic border-t border-stone-200 pt-3">
            "Este documento es una representación impresa y legal de un CFDI 4.0 emitida por {invoice.issuer.tradeName}"
          </div>
        </div>
      </div>
    </div>
  );
};
