import React, { useState, useEffect } from 'react';
import { Product, CostBreakdown } from '../types';
import { calculatePricingFromCost } from '../utils/storage';
import { X, DollarSign, Calculator, Percent, Sparkles, Check, TrendingUp, Package, Scissors, Truck } from 'lucide-react';

interface ProductCostModalProps {
  product: Product | null;
  onClose: () => void;
  onSaveCost: (productId: string, breakdown: CostBreakdown, totalCost: number, profitAmount: number, sellingPrice: number) => void;
}

export const ProductCostModal: React.FC<ProductCostModalProps> = ({
  product,
  onClose,
  onSaveCost,
}) => {
  if (!product) return null;

  const [baseCost, setBaseCost] = useState<number>(product.costBreakdown.baseCost || 0);
  const [laborCost, setLaborCost] = useState<number>(product.costBreakdown.laborCost || 0);
  const [packagingCost, setPackagingCost] = useState<number>(product.costBreakdown.packagingCost || 0);
  const [shippingCost, setShippingCost] = useState<number>(product.costBreakdown.shippingCost || 0);
  const [otherExpenses, setOtherExpenses] = useState<number>(product.costBreakdown.otherExpenses || 0);
  const [marginPercentage, setMarginPercentage] = useState<number>(product.costBreakdown.marginPercentage || 60);

  // Computed state
  const [totalCost, setTotalCost] = useState<number>(product.totalCost);
  const [profitAmount, setProfitAmount] = useState<number>(product.profitAmount);
  const [sellingPrice, setSellingPrice] = useState<number>(product.sellingPrice);

  useEffect(() => {
    const calc = calculatePricingFromCost({
      baseCost,
      laborCost,
      packagingCost,
      shippingCost,
      otherExpenses,
      marginPercentage,
    });
    setTotalCost(calc.totalCost);
    setProfitAmount(calc.profitAmount);
    setSellingPrice(calc.sellingPrice);
  }, [baseCost, laborCost, packagingCost, shippingCost, otherExpenses, marginPercentage]);

  const handleManualPriceChange = (newPrice: number) => {
    setSellingPrice(newPrice);
    const sumCosts = baseCost + laborCost + packagingCost + shippingCost + otherExpenses;
    if (sumCosts > 0) {
      const calculatedProfit = newPrice - sumCosts;
      setProfitAmount(calculatedProfit);
      const calculatedMargin = Math.round((calculatedProfit / sumCosts) * 100);
      setMarginPercentage(calculatedMargin > 0 ? calculatedMargin : 0);
    }
  };

  const handleSave = () => {
    onSaveCost(
      product.id,
      {
        baseCost,
        laborCost,
        packagingCost,
        shippingCost,
        otherExpenses,
        marginPercentage,
      },
      totalCost,
      profitAmount,
      sellingPrice
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Calculator className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-100">
                Calculadora de Costos & Margen
              </h3>
              <p className="text-xs text-stone-400 truncate max-w-[260px]">
                {product.name}
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Explanation */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">
                Fórmula de Ganancia de Esmeralda Zepeda
              </p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Ingresa tus costos reales de confección, empaque y logística. El sistema calcula automáticamente el precio de venta sugerido y tu ganancia neta.
              </p>
            </div>
          </div>

          {/* Cost Items Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <span>Desglose de Costos Unitarios</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Base Cost */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5 text-stone-500" />
                  Costo Base (Tela / Confección)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-2 text-stone-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={baseCost || ''}
                    onChange={(e) => setBaseCost(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Labor */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-stone-500" />
                  Mano de Obra / Arreglos
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-2 text-stone-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={laborCost || ''}
                    onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Packaging */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-stone-500" />
                  Empaque Boutique & Listón
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-2 text-stone-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={packagingCost || ''}
                    onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-stone-500" />
                  Flete / Logística Prorrateada
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-2 text-stone-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={shippingCost || ''}
                    onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Other expenses */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 sm:col-span-2">
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-stone-500" />
                  Otros Gastos (Comisiones, etiquetas, aroma)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-2 text-stone-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={otherExpenses || ''}
                    onChange={(e) => setOtherExpenses(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Margin Configuration */}
          <div className="bg-amber-50/70 border border-amber-300/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-amber-700" />
                Margen de Ganancia Deseado
              </label>
              <span className="text-sm font-extrabold text-amber-900 font-mono bg-amber-200/60 px-2 py-0.5 rounded">
                {marginPercentage}%
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={marginPercentage}
              onChange={(e) => setMarginPercentage(parseInt(e.target.value) || 0)}
              className="w-full accent-amber-600 h-2 bg-amber-200 rounded-lg cursor-pointer"
            />

            <div className="flex gap-1.5 flex-wrap">
              {[40, 50, 65, 75, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMarginPercentage(preset)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    marginPercentage === preset
                      ? 'bg-amber-700 text-white'
                      : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="bg-stone-900 text-stone-100 rounded-xl p-4 border border-stone-800 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400">
              Resultado Financiero
            </h4>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700/60">
                <span className="text-[10px] text-stone-400 uppercase font-medium block">
                  Costo Total
                </span>
                <span className="text-xs sm:text-sm font-bold text-stone-200 font-mono">
                  ${totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-emerald-950/80 p-2.5 rounded-lg border border-emerald-700/60">
                <span className="text-[10px] text-emerald-300 uppercase font-medium block">
                  Tu Ganancia
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                  +${profitAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-amber-950/80 p-2.5 rounded-lg border border-amber-700/60">
                <span className="text-[10px] text-amber-300 uppercase font-medium block">
                  Precio Venta
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-amber-300 font-mono">
                  ${sellingPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Custom Price Adjustment */}
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-3">
              <span className="text-xs text-stone-300 font-medium">
                Ajustar Precio Manualmente ($):
              </span>
              <div className="w-28 relative">
                <span className="absolute left-2.5 top-1.5 text-stone-400 text-xs">$</span>
                <input
                  type="number"
                  step="10"
                  value={sellingPrice}
                  onChange={(e) => handleManualPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full pl-6 pr-2 py-1 bg-stone-800 border border-stone-700 rounded-lg text-xs font-mono font-bold text-amber-300 text-right focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Costos y Precio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
