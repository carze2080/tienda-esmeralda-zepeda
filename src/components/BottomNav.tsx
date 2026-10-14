import React from 'react';
import { ShoppingBag, Package, Bell, Receipt, TrendingUp } from 'lucide-react';

export type TabType = 'pos' | 'inventario' | 'pedidos' | 'facturas' | 'finanzas';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  newOrdersCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  newOrdersCount,
}) => {
  const navItems = [
    {
      id: 'pos' as TabType,
      label: 'Vender',
      icon: ShoppingBag,
    },
    {
      id: 'inventario' as TabType,
      label: 'Inventario',
      icon: Package,
    },
    {
      id: 'pedidos' as TabType,
      label: 'Pedidos',
      icon: Bell,
      badge: newOrdersCount,
    },
    {
      id: 'facturas' as TabType,
      label: 'Facturas',
      icon: Receipt,
    },
    {
      id: 'finanzas' as TabType,
      label: 'Finanzas',
      icon: TrendingUp,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 px-2 py-1.5 transition-all shadow-xl">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-400 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-amber-400' : 'text-stone-400'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-full ${
                isActive ? 'text-amber-300 font-semibold' : 'text-stone-400'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-1 w-4 h-1 bg-amber-400 rounded-full shadow-sm"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
