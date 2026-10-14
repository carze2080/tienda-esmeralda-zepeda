import React from 'react';
import { Product, Order, BoutiqueProfile } from '../types';
import { 
  TrendingUp, DollarSign, PieChart, Sparkles, Award, 
  Scissors, Package, Truck, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import { formatUSD } from '../utils/currency';

interface FinancesViewProps {
  products: Product[];
  orders: Order[];
  profile: BoutiqueProfile;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  products,
  orders,
  profile,
}) => {
  // Aggregate order financial data
  const totalSalesRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCostOfGoodsSold = orders.reduce((sum, o) => sum + o.totalCost, 0);
  const totalNetProfit = orders.reduce((sum, o) => sum + o.profit, 0);
  const overallMargin = totalSalesRevenue > 0 
    ? Math.round((totalNetProfit / totalSalesRevenue) * 100) 
    : 0;

  const averageTicket = orders.length > 0 
    ? totalSalesRevenue / orders.length 
    : 0;

  // Inventory valuation
  const inventoryCostValue = products.reduce((sum, p) => sum + (p.totalCost * p.totalStock), 0);
  const inventorySalesValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.totalStock), 0);
  const potentialInventoryProfit = inventorySalesValue - inventoryCostValue;

  // Ranking most profitable garments
  const rankedProducts = [...products].sort((a, b) => b.profitAmount - a.profitAmount);

  // Cost component distribution across catalog
  const totalCatalogBaseCost = products.reduce((sum, p) => sum + p.costBreakdown.baseCost, 0);
  const totalCatalogLaborCost = products.reduce((sum, p) => sum + p.costBreakdown.laborCost, 0);
  const totalCatalogPkgCost = products.reduce((sum, p) => sum + p.costBreakdown.packagingCost, 0);
  const totalCatalogShipCost = products.reduce((sum, p) => sum + p.costBreakdown.shippingCost, 0);
  const totalAllCosts = totalCatalogBaseCost + totalCatalogLaborCost + totalCatalogPkgCost + totalCatalogShipCost || 1;

  const basePct = Math.round((totalCatalogBaseCost / totalAllCosts) * 100);
  const laborPct = Math.round((totalCatalogLaborCost / totalAllCosts) * 100);
  const pkgPct = Math.round((totalCatalogPkgCost / totalAllCosts) * 100);
  const shipPct = Math.round((totalCatalogShipCost / totalAllCosts) * 100);

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-5xl mx-auto space-y-4">
      {/* Financial Hero Header */}
      <div className="bg-stone-900 text-stone-100 p-4 sm:p-5 rounded-2xl border border-stone-800 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-amber-200">
                  Control Financiero de Esmeralda Zepeda
                </h2>
                <p className="text-xs text-stone-400">
                  Costos reales, márgenes comerciales y utilidad neta en <strong>Dólares Estadounidenses (USD)</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/80 border border-emerald-700/80 rounded-xl px-3.5 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">
              Margen de Ganancia Promedio
            </span>
            <span className="text-xl font-black font-mono text-emerald-400">
              {overallMargin}%
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core Financial KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
            Ingresos por Ventas (USD)
          </span>
          <p className="text-base sm:text-lg font-black font-mono text-stone-900 mt-1">
            {formatUSD(totalSalesRevenue)}
          </p>
          <span className="text-[10px] text-stone-600 mt-0.5 block">
            {orders.length} ventas procesadas
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
            Costo de lo Vendido (USD)
          </span>
          <p className="text-base sm:text-lg font-bold font-mono text-stone-700 mt-1">
            {formatUSD(totalCostOfGoodsSold)}
          </p>
          <span className="text-[10px] text-stone-600 mt-0.5 block">
            Inversión recuperada
          </span>
        </div>

        <div className="bg-emerald-900 text-white p-3.5 rounded-2xl border border-emerald-700 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
            Ganancia Neta Limpia (USD)
          </span>
          <p className="text-base sm:text-lg font-black font-mono text-amber-300 mt-1">
            +{formatUSD(totalNetProfit)}
          </p>
          <span className="text-[10px] text-emerald-200/90 mt-0.5 block">
            Tu beneficio en caja
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
            Ticket Promedio (USD)
          </span>
          <p className="text-base sm:text-lg font-bold font-mono text-stone-900 mt-1">
            {formatUSD(averageTicket)}
          </p>
          <span className="text-[10px] text-stone-600 mt-0.5 block">
            Por compra realizada
          </span>
        </div>
      </div>

      {/* Inventory Projected Value */}
      <div className="bg-gradient-to-r from-stone-900 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 border border-emerald-800/60 shadow-md">
        <h3 className="text-xs uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Valor del Inventario en Tu Boutique Hoy (en USD)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
            <span className="text-[10px] text-stone-400 block font-medium">Inversión Actual en Ropa</span>
            <span className="text-base sm:text-lg font-bold font-mono text-stone-200">
              {formatUSD(inventoryCostValue)}
            </span>
          </div>

          <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
            <span className="text-[10px] text-amber-300 block font-medium">Valor Total al Vender Todo</span>
            <span className="text-base sm:text-lg font-bold font-mono text-amber-300">
              {formatUSD(inventorySalesValue)}
            </span>
          </div>

          <div className="bg-emerald-900/80 p-3 rounded-xl border border-emerald-700">
            <span className="text-[10px] text-emerald-300 block font-bold">Ganancia Neta por Cobrar</span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
              +{formatUSD(potentialInventoryProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Cost Distribution Breakdown */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-3">
        <h3 className="text-xs uppercase font-bold tracking-wider text-stone-700 flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-emerald-700" />
          ¿En qué se van los costos de tus prendas?
        </h3>

        {/* Progress bar visual */}
        <div className="h-3 w-full rounded-full overflow-hidden flex bg-stone-100">
          <div style={{ width: `${basePct}%` }} className="bg-emerald-700" title={`Telas/Confección ${basePct}%`} />
          <div style={{ width: `${laborPct}%` }} className="bg-amber-600" title={`Mano de Obra ${laborPct}%`} />
          <div style={{ width: `${pkgPct}%` }} className="bg-rose-500" title={`Empaque ${pkgPct}%`} />
          <div style={{ width: `${shipPct}%` }} className="bg-blue-600" title={`Logística ${shipPct}%`} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-700 shrink-0"></span>
            <div>
              <p className="font-bold text-stone-800">Telas / Base: {basePct}%</p>
              <p className="text-[10px] text-stone-500">${totalCatalogBaseCost} en catálogo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-600 shrink-0"></span>
            <div>
              <p className="font-bold text-stone-800">Mano de Obra: {laborPct}%</p>
              <p className="text-[10px] text-stone-500">${totalCatalogLaborCost} en catálogo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
            <div>
              <p className="font-bold text-stone-800">Empaque Lujo: {pkgPct}%</p>
              <p className="text-[10px] text-stone-500">${totalCatalogPkgCost} en catálogo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0"></span>
            <div>
              <p className="font-bold text-stone-800">Logística / Flete: {shipPct}%</p>
              <p className="text-[10px] text-stone-500">${totalCatalogShipCost} en catálogo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking of Most Profitable Garments */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-3">
        <h3 className="text-xs uppercase font-bold tracking-wider text-stone-700 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          Prendas que Más Dinero Te Dejan (Por Margen de Utilidad)
        </h3>

        <div className="divide-y divide-stone-100">
          {rankedProducts.map((p, idx) => (
            <div key={p.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-full bg-stone-100 font-bold font-mono text-stone-700 flex items-center justify-center shrink-0 text-xs">
                  #{idx + 1}
                </span>
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-11 rounded-lg object-cover bg-stone-100 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-stone-900 truncate">{p.name}</p>
                  <p className="text-[10px] text-stone-500 font-mono">
                    Costo: ${p.totalCost} • PVP: ${p.sellingPrice}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-bold font-mono text-emerald-800 text-sm">
                  +${p.profitAmount.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] block text-stone-600 font-semibold">
                  {p.costBreakdown.marginPercentage}% de margen
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
