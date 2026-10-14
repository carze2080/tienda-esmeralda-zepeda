import React, { useState } from 'react';
import { Product, ProductCategory, ClothingSize, ProductVariant, CostBreakdown } from '../types';
import { calculatePricingFromCost } from '../utils/storage';
import { 
  Package, Plus, Search, Filter, AlertTriangle, 
  Calculator, Edit, Trash2, ArrowUpDown, Check, X,
  Tag, Layers, Sparkles
} from 'lucide-react';
import { formatUSD } from '../utils/currency';

interface InventoryViewProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onOpenCostCalculator: (product: Product) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Vestidos',
  'Blusas y Tops',
  'Blazers y Sacos',
  'Pantalones',
  'Faldas',
  'Conjuntos',
  'Accesorios',
  'Calzado',
];

const AVAILABLE_SIZES: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'Unitalla'];

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onOpenCostCalculator,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New/Edit product form state
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Vestidos');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formColor, setFormColor] = useState('Verde Esmeralda');
  
  // Cost form breakdown in USD
  const [costBase, setCostBase] = useState(25);
  const [costLabor, setCostLabor] = useState(10);
  const [costPkg, setCostPkg] = useState(3);
  const [costShip, setCostShip] = useState(4);
  const [costOther, setCostOther] = useState(2);
  const [marginPct, setMarginPct] = useState(65);

  // Variants state
  const [selectedSizes, setSelectedSizes] = useState<Record<ClothingSize, number>>({
    XS: 0,
    S: 3,
    M: 3,
    L: 2,
    XL: 0,
    Unitalla: 0,
  });

  // Calculate totals for top summary
  const totalStockUnits = products.reduce((acc, p) => acc + p.totalStock, 0);
  const totalCostInvested = products.reduce((acc, p) => acc + p.totalCost * p.totalStock, 0);
  const totalRetailValue = products.reduce((acc, p) => acc + p.sellingPrice * p.totalStock, 0);
  const totalProjectedProfit = totalRetailValue - totalCostInvested;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'todos' || p.category === selectedCategory;
    const matchesLowStock = !filterLowStock || p.totalStock <= 3;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleOpenAddModal = (prodToEdit?: Product) => {
    if (prodToEdit) {
      setEditingProduct(prodToEdit);
      setFormName(prodToEdit.name);
      setFormSku(prodToEdit.sku);
      setFormCategory(prodToEdit.category);
      setFormDescription(prodToEdit.description);
      setFormImageUrl(prodToEdit.imageUrl || '');
      setCostBase(prodToEdit.costBreakdown.baseCost);
      setCostLabor(prodToEdit.costBreakdown.laborCost);
      setCostPkg(prodToEdit.costBreakdown.packagingCost);
      setCostShip(prodToEdit.costBreakdown.shippingCost);
      setCostOther(prodToEdit.costBreakdown.otherExpenses);
      setMarginPct(prodToEdit.costBreakdown.marginPercentage);
      setFormColor(prodToEdit.variants[0]?.color || 'Verde Esmeralda');

      const sizeMap: Record<ClothingSize, number> = {
        XS: 0, S: 0, M: 0, L: 0, XL: 0, Unitalla: 0
      };
      prodToEdit.variants.forEach((v) => {
        sizeMap[v.size] = v.stock;
      });
      setSelectedSizes(sizeMap);
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormSku(`EZ-${Math.floor(100 + Math.random() * 900)}`);
      setFormCategory('Vestidos');
      setFormDescription('');
      setFormImageUrl('');
      setCostBase(350);
      setCostLabor(90);
      setCostPkg(35);
      setCostShip(30);
      setCostOther(20);
      setMarginPct(65);
      setFormColor('Verde Esmeralda');
      setSelectedSizes({ XS: 0, S: 3, M: 4, L: 2, XL: 0, Unitalla: 0 });
    }
    setIsAddModalOpen(true);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const breakdown: CostBreakdown = {
      baseCost: costBase,
      laborCost: costLabor,
      packagingCost: costPkg,
      shippingCost: costShip,
      otherExpenses: costOther,
      marginPercentage: marginPct,
    };
    const pricing = calculatePricingFromCost(breakdown);

    // Build variants
    const variants: ProductVariant[] = [];
    let totalStock = 0;
    Object.entries(selectedSizes).forEach(([sizeKey, qty]) => {
      if (qty > 0) {
        variants.push({
          size: sizeKey as ClothingSize,
          color: formColor,
          stock: qty,
          sku: `${formSku}-${sizeKey}`,
        });
        totalStock += qty;
      }
    });

    if (variants.length === 0) {
      variants.push({
        size: 'M',
        color: formColor,
        stock: 1,
        sku: `${formSku}-M`,
      });
      totalStock = 1;
    }

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: formName,
        sku: formSku,
        category: formCategory,
        description: formDescription,
        imageUrl: formImageUrl || editingProduct.imageUrl,
        costBreakdown: breakdown,
        totalCost: pricing.totalCost,
        profitAmount: pricing.profitAmount,
        sellingPrice: pricing.sellingPrice,
        variants,
        totalStock,
      };
      onUpdateProduct(updated);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: formName,
        sku: formSku,
        category: formCategory,
        description: formDescription || 'Prenda exclusiva confeccionada por Esmeralda Zepeda Boutique.',
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
        costBreakdown: breakdown,
        totalCost: pricing.totalCost,
        profitAmount: pricing.profitAmount,
        sellingPrice: pricing.sellingPrice,
        variants,
        totalStock,
        createdAt: new Date().toISOString(),
      };
      onAddProduct(newProd);
    }

    setIsAddModalOpen(false);
  };

  // Quick mobile stock adjustment (+ / -) for a variant
  const handleQuickStockAdjust = (product: Product, size: ClothingSize, delta: number) => {
    const updatedVariants = product.variants.map((v) => {
      if (v.size === size) {
        return { ...v, stock: Math.max(0, v.stock + delta) };
      }
      return v;
    });
    const newTotalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
    onUpdateProduct({
      ...product,
      variants: updatedVariants,
      totalStock: newTotalStock,
    });
  };

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-5xl mx-auto space-y-4">
      {/* Top Financial & Stock Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-stone-900 text-stone-100 p-3 rounded-2xl border border-stone-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Prendas en Stock
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-300">
              {totalStockUnits}
            </span>
            <span className="text-xs text-stone-400">uds.</span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium">
            {products.length} modelos activos
          </span>
        </div>

        <div className="bg-stone-900 text-stone-100 p-3 rounded-2xl border border-stone-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Inversión en Costo
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-xl font-bold font-mono text-stone-200">
              {formatUSD(totalCostInvested)}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium">
            Telas + confección + empaque
          </span>
        </div>

        <div className="bg-stone-900 text-stone-100 p-3 rounded-2xl border border-stone-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Valor de Venta Total
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-xl font-bold font-mono text-amber-400">
              {formatUSD(totalRetailValue)}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium">
            Al precio de venta sugerido
          </span>
        </div>

        <div className="bg-emerald-950 text-white p-3 rounded-2xl border border-emerald-800/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">
            Ganancia Neta Proyectada
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-xl font-black font-mono text-emerald-400">
              +{formatUSD(totalProjectedProfit)}
            </span>
          </div>
          <span className="text-[10px] text-emerald-200/80 font-medium">
            Tu utilidad estimada en USD
          </span>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por vestido, blazer, blusa, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-stone-300 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 text-xs"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              filterLowStock
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Poco Stock (≤3)</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Prenda</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedCategory('todos')}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition cursor-pointer ${
            selectedCategory === 'todos'
              ? 'bg-stone-900 text-white font-bold shadow-sm'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          Todas ({products.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = products.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white font-bold shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Product List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-700/40 transition"
          >
            <div className="p-3.5 sm:p-4">
              {/* Product header & image */}
              <div className="flex gap-3 items-start">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-100 shadow-inner"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                      {product.category}
                    </span>
                    <span className="text-[10px] font-mono text-stone-600">
                      {product.sku}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 mt-1 line-clamp-1">
                    {product.name}
                  </h3>

                  <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-tight">
                    {product.description}
                  </p>

                  {/* Pricing and Profit strip */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <div className="bg-stone-100 px-2 py-1 rounded-lg text-xs font-mono">
                      <span className="text-stone-600 text-[10px]">Costo: </span>
                      <span className="font-bold text-stone-800">
                        {formatUSD(product.totalCost)}
                      </span>
                    </div>

                    <div className="bg-amber-100 text-amber-950 px-2 py-1 rounded-lg text-xs font-mono font-bold">
                      <span className="text-amber-800 text-[10px]">PVP: </span>
                      <span>
                        {formatUSD(product.sellingPrice)}
                      </span>
                    </div>

                    <div className="bg-emerald-100 text-emerald-900 px-2 py-1 rounded-lg text-xs font-mono font-bold">
                      <span className="text-emerald-700 text-[10px]">Ganancia: </span>
                      <span>
                        +{formatUSD(product.profitAmount)}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold ml-1">
                        ({product.costBreakdown.marginPercentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sizes and Stock pills with quick increment/decrement */}
              <div className="mt-3 pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-stone-700 flex items-center gap-1 text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-stone-600" />
                    Existencias por Talla (Total: {product.totalStock}):
                  </span>
                  {product.totalStock <= 3 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      ¡Stock bajo!
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map((v) => (
                    <div
                      key={v.sku}
                      className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs"
                    >
                      <span className="font-bold text-stone-800 text-[11px]">{v.size}:</span>
                      <span className={`font-mono font-bold text-xs ${v.stock <= 1 ? 'text-red-600' : 'text-stone-700'}`}>
                        {v.stock}
                      </span>
                      {/* Fast adjust buttons */}
                      <button
                        onClick={() => handleQuickStockAdjust(product, v.size, -1)}
                        title="Restar 1 pieza"
                        disabled={v.stock <= 0}
                        className="w-4 h-4 rounded bg-stone-200 hover:bg-stone-300 disabled:opacity-30 text-stone-700 flex items-center justify-center font-bold text-[10px] ml-0.5"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleQuickStockAdjust(product, v.size, 1)}
                        title="Añadir 1 pieza"
                        className="w-4 h-4 rounded bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center font-bold text-[10px]"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions for garment */}
            <div className="bg-stone-50 px-3.5 py-2 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenCostCalculator(product)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 py-1 px-2 rounded-lg hover:bg-emerald-100/60 transition cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                <span>Costos & Margen</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenAddModal(product)}
                  className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200 transition"
                  title="Editar prenda"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar "${product.name}" del catálogo de Esmeralda Zepeda?`)) {
                      onDeleteProduct(product.id);
                    }
                  }}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                  title="Eliminar prenda"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-emerald-300/80 shadow-sm space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <Package className="w-8 h-8 text-emerald-700" />
            </div>
            <h4 className="font-serif text-xl font-bold text-stone-900">
              Tu Boutique está lista y limpia
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Comienza a subir tu catálogo real de vestidos, blusas, pantalones y accesorios. Podrás definir tus costos de confección y tu margen de ganancia en cada una.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleOpenAddModal()}
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Subir Mi Primera Prenda</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-stone-800">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                {editingProduct ? 'Editar Prenda' : 'Nueva Prenda para la Boutique'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Nombre de la Prenda *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Vestido Gala Satín Esmeralda"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Código SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="EZ-VEST-001"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Descripción / Detalles de Confección
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Detalles de tela, silueta, cuidados o caída de la prenda..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    URL de Imagen de la Prenda
                  </label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://... (Opcional, se usará una por defecto si está vacío)"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Color Principal
                  </label>
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="Verde Esmeralda, Negro Azabache, Champagne..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Tallas y Stock */}
              <div className="border border-stone-200 rounded-xl p-3 bg-stone-50">
                <label className="text-xs font-bold text-stone-800 block mb-2">
                  Existencias por Talla
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {AVAILABLE_SIZES.map((sz) => (
                    <div key={sz} className="text-center">
                      <span className="text-[11px] font-bold text-stone-600 block mb-1">{sz}</span>
                      <input
                        type="number"
                        min="0"
                        value={selectedSizes[sz]}
                        onChange={(e) => setSelectedSizes({ ...selectedSizes, [sz]: parseInt(e.target.value) || 0 })}
                        className="w-full p-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Costos y Margen dentro del formulario */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-3">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-amber-700" />
                  Manejo de Costos y Margen de Venta
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block">Costo Tela / Confección</label>
                    <input
                      type="number"
                      value={costBase}
                      onChange={(e) => setCostBase(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-stone-300 rounded-lg font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block">Mano de Obra</label>
                    <input
                      type="number"
                      value={costLabor}
                      onChange={(e) => setCostLabor(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-stone-300 rounded-lg font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block">Empaque Boutique</label>
                    <input
                      type="number"
                      value={costPkg}
                      onChange={(e) => setCostPkg(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-stone-300 rounded-lg font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block">Flete / Envíos</label>
                    <input
                      type="number"
                      value={costShip}
                      onChange={(e) => setCostShip(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-stone-300 rounded-lg font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block">Otros Gastos</label>
                    <input
                      type="number"
                      value={costOther}
                      onChange={(e) => setCostOther(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-stone-300 rounded-lg font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-amber-800 block">Margen Ganancia %</label>
                    <input
                      type="number"
                      value={marginPct}
                      onChange={(e) => setMarginPct(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 bg-white border border-amber-300 rounded-lg font-mono text-xs font-extrabold text-amber-900"
                    />
                  </div>
                </div>

                {/* Previsualización del cálculo */}
                {(() => {
                  const preview = calculatePricingFromCost({
                    baseCost: costBase,
                    laborCost: costLabor,
                    packagingCost: costPkg,
                    shippingCost: costShip,
                    otherExpenses: costOther,
                    marginPercentage: marginPct,
                  });
                  return (
                    <div className="bg-stone-900 text-stone-100 p-2.5 rounded-lg flex items-center justify-around text-center text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Costo Total:</span>
                        <span className="font-mono font-bold text-stone-200">${preview.totalCost}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 block">Tu Ganancia:</span>
                        <span className="font-mono font-bold text-emerald-400">+${preview.profitAmount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-300 block">PVP Sugerido:</span>
                        <span className="font-mono font-black text-amber-300 text-sm">${preview.sellingPrice}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Prenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
